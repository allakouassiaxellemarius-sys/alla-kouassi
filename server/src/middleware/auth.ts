import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "competition-platform-secret-key-2026";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function generateToken(userId: string, role: string = "user"): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token d'authentification requis" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ error: "Token invalide ou expiré" });
  }
}
