import express from "express";
import cors from "cors";
import type { CreateLinkRequest } from "@url-shortener/shared";
import "dotenv/config";
import { eq, and, desc } from "drizzle-orm";
import { db } from "./db/client";
import { links } from "./db/schema";
import { randomCode } from "./lib/code";
import { connectRedis, redis } from "./lib/redis";
import cookieParser from "cookie-parser";
import { visitorMiddleware } from "./middleware/visitor";
import { rateLimit } from "./middleware/rateLimit";
import { urlKey, codeKey } from "./lib/redisKeys";

const app = express();
app.use((req, _res, next) => {
  console.log("INCOMING:", req.method, req.url);
  next();
});

app.set("trust proxy", 1);
app.use(express.json());

const PORT = process.env.PORT || 3000;
const LINK_TTL = 60 * 60 * 24;
const baseUrl =
  (process.env.LIVE_URL ?? `http://localhost:${PORT}/`).replace(/\/?$/, "/");
const allowedOrigins = ["http://localhost:5173", "https://urltinyr.com"];

app.use(
  cors({
    origin: (origin, cb) => {
      // allow server-to-server / curl / no-origin requests
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// cookie middleware
app.use(visitorMiddleware);


function isValidHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}


app.get("/health", (req, res) => {
  console.log(PORT);
  res.json({ ok: true });
});

// generate session
app.get("/api/session", (req, res) => {
  res.json({ ok: true, visitorId: (req as any).visitorId });
});

app.post(
  "/api/links",
  rateLimit({ windowSec: 60, max: 20, keyPrefix: "rl:links:create" }),
  async (req, res) => {
    const visitorId = (req as any).visitorId as string;
    const longUrl = String(req.body?.longUrl ?? "").trim();

    if (!longUrl) return res.status(400).json({ error: "longUrl is required" });
    if (!isValidHttpUrl(longUrl)) {
      return res.status(400).json({ error: "longUrl must start with http:// or https://" });
    }

    const cachedCode = await redis.get(urlKey(longUrl));
    if (cachedCode) {
      await redis.set(codeKey(cachedCode), longUrl, { EX: LINK_TTL });


      return res.status(200).json({
        code: cachedCode,
        shortUrl: baseUrl + cachedCode,
      });

    }

    const existing = await db
      .select({ code: links.code, longUrl: links.longUrl })
      .from(links)
      .where(and(eq(links.longUrl, longUrl), eq(links.deleted, false)))
      .limit(1);

    if (existing[0]) {
      const code = existing[0].code;

      await Promise.all([
        redis.set(urlKey(longUrl), code, { EX: LINK_TTL }),
        redis.set(codeKey(code), longUrl, { EX: LINK_TTL }),
      ]);

      return res.status(200).json({
        code,
        shortUrl: baseUrl + code,
      });
    }

    for (let attempt = 0; attempt < 10; attempt++) {
      const code = randomCode(7);

      try {
        await db.insert(links).values({ code, longUrl, visitorId });

        await Promise.all([
          redis.set(urlKey(longUrl), code, { EX: LINK_TTL }),
          redis.set(codeKey(code), longUrl, { EX: LINK_TTL }),
        ]);

        return res.status(201).json({
          code,
          shortUrl: baseUrl + code,
        });
      } catch (err) {
        if (attempt < 9) continue;
        return res.status(500).json({ error: "Failed to create short link" });
      }
    }
  }
);


app.get("/api/links/recent", async (req, res) => {
  const visitorId = (req as any).visitorId as string;

  const rows = await db
    .select({
      id: links.id,
      code: links.code,
      longUrl: links.longUrl,
      createdAt: links.createdAt,
    })
    .from(links)
    .where(and(eq(links.visitorId, visitorId), eq(links.deleted, false)))
    .orderBy(desc(links.createdAt))
    .limit(20);


  res.json(
    rows.map((r) => ({
      id: r.id,
      original: r.longUrl,
      short: `${baseUrl}${r.code}`,
      createdAt: r.createdAt,
    }))
  );
});


app.get("/:code", async (req, res) => {
  const { code } = req.params;

  const cached = await redis.get(codeKey(code));
  console.log("REDIS", cached);

  if (cached) return res.redirect(302, cached);

  const row = await db
    .select({ longUrl: links.longUrl })
    .from(links)
    .where(eq(links.code, code))
    .limit(1);

  if (!row[0]) return res.status(404).send("Not found");

  await redis.set(codeKey(code), row[0].longUrl, { EX: LINK_TTL });

  return res.redirect(302, row[0].longUrl);
});

app.delete("/api/links/:id", async (req, res) => {
  const visitorId = (req as any).visitorId as string;
  const id = String(req.params.id);

  await db
    .update(links)
    .set({ deleted: true })
    .where(and(eq(links.id, id as any), eq(links.visitorId, visitorId)));

  res.json({ ok: true });
});

app.delete("/api/links", async (req, res) => {
  const visitorId = (req as any).visitorId as string;

  await db.update(links).set({ deleted: true }).where(eq(links.visitorId, visitorId));

  res.json({ ok: true });
});



app.listen(PORT, async () => {
  await connectRedis();
  console.log(`running on http://localhost:${PORT}`);
});
