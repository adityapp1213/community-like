import { getAuth } from "@clerk/express";

export function requireUser(req, res, next) {
  const auth = getAuth(req);
  if (!auth.userId) return res.status(401).json({ error: "Sign in required" });
  req.auth = auth;
  next();
}
