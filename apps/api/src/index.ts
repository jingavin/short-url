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

const app = express();
app.use((req, _res, next) => {
  console.log("INCOMING:", req.method, req.url);
  next();
});

app.set("trust proxy", 1);
app.use(express.json());

const PORT = process.env.PORT || 3000;
const LIVE_URL = process.env.LIVE_URL;

app.use(
  cors({
    origin: "http://localhost:5173",
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

app.post("/api/links", async (req, res) => {
  const visitorId = (req as any).visitorId as string;
  const longUrl = String(req.body?.longUrl ?? "").trim();

  if (!longUrl) return res.status(400).json({ error: "longUrl is required" });
  if (!isValidHttpUrl(longUrl)) {
    return res.status(400).json({ error: "longUrl must start with http:// or https://" });
  }

  console.log("user url:", longUrl);
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode(7);

    try {
      await db.insert(links).values({ code, longUrl, visitorId });

      return res.status(201).json({
        code,
        shortUrl: `http://localhost:${PORT}/${code}`,
      });
    } catch (err) {
      if (attempt < 9) continue;
      return res.status(500).json({ error: "Failed to create short link" });
    }
  }
});

app.get("/api/links/recent", async (req, res) => {
  const visitorId = (req as any).visitorId as string;

  const rows = await db
    .select({
      code: links.code,
      longUrl: links.longUrl,
      createdAt: links.createdAt,
    })
    .from(links)
    .where(and(eq(links.visitorId, visitorId), eq(links.deleted, false)))
    .orderBy(desc(links.createdAt))
    .limit(20);

  res.json(rows);
});

app.get("/:code", async (req, res) => {
  const { code } = req.params;

  const cached = await redis.get(`c:${code}`);
  if (cached) {
    return res.redirect(302, cached);
  }

  const row = await db
    .select()
    .from(links)
    .where(eq(links.code, code))
    .limit(1);

  if (!row[0]) return res.status(404).send("Not found");

  await redis.set(`c:${code}`, row[0].longUrl, {
    EX: 60 * 60 * 24, // 1 day
  });

  return res.redirect(302, row[0].longUrl);
});
app.listen(PORT, async () => {
  await connectRedis();
  console.log(`running on http://localhost:${PORT}`);
});
