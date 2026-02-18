import express from "express";
import cors from "cors";
import type { CreateLinkRequest } from "@url-shortener/shared";
import "dotenv/config";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/health", (req, res) => {
  console.log(PORT);
  res.json({ ok: true });
});

app.post("/api/links", (req, res) => {
  const longUrl = String(req.body?.longUrl ?? "").trim();

  if (!longUrl) {
    return res.status(400).json({ error: "longUrl is required" });
  }

  console.log("user url:", longUrl);

  res.json({ code: "abc123" });
});

app.get("/:code", (req, res) => {
  res.redirect(302, "https://example.com");
});

app.listen(PORT, () => {
  console.log(`running on http://localhost:${PORT}`);
});
