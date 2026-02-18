import express from "express";
import cors from "cors";
import type { CreateLinkRequest } from "@url-shortener/shared";
import "dotenv/config";
import { eq, and } from "drizzle-orm";
import { db } from "./db/client";
import { links } from "./db/schema";
import { randomCode } from "./lib/code";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());


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

app.post("/api/links", async (req, res) => {
  const longUrl = String(req.body?.longUrl ?? "").trim();

  if (!longUrl) return res.status(400).json({ error: "longUrl is required" });
  if (!isValidHttpUrl(longUrl)) {
    return res.status(400).json({ error: "longUrl must start with http:// or https://" });
  }

  console.log("user url:", longUrl);
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode(7);

    try {
      await db.insert(links).values({ code, longUrl });
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

app.get("/:code", (req, res) => {
  res.redirect(302, "https://example.com");
});

app.listen(PORT, () => {
  console.log(`running on http://localhost:${PORT}`);
});
