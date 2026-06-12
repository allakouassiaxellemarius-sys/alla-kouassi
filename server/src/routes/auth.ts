import { Router, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../prisma/client.js";
import { generateToken, authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req: AuthRequest, res: Response) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      res.status(400).json({ error: "Email, nom d'utilisateur et mot de passe requis" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères" });
      return;
    }
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      res.status(409).json({ error: "Email ou nom d'utilisateur déjà utilisé" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword },
      select: { id: true, email: true, username: true, role: true },
    });
    const token = generateToken(user.id, user.role);
    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/login", async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email et mot de passe requis" });
      return;
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Email ou mot de passe incorrect" });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Email ou mot de passe incorrect" });
      return;
    }
    const token = generateToken(user.id, user.role);
    res.json({
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, username: true, avatar: true, role: true },
    });
    if (!user) {
      res.status(404).json({ error: "Utilisateur non trouvé" });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
