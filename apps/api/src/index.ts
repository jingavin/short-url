import express from "express";
import cors from "cors";
import type { CreateLinkRequest } from "@url-shortener/shared";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/links", (req, res) => {
  res.json({ code: "abc123" });
});

app.get("/:code", (req, res) => {
  res.redirect(302, "https://example.com");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`running on http://localhost:${PORT}`);
});
