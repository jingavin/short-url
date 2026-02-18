import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export function visitorMiddleware(req: Request, res: Response, next: NextFunction) {
  let visitorId = req.cookies?.visitorId;
  console.log("hit middle ware");

  if (!visitorId) {
    visitorId = crypto.randomUUID();

    res.cookie("visitorId", visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  console.log(visitorId);

  (req as any).visitorId = visitorId;
  next();
}
