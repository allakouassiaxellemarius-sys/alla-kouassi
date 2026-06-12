import { Router, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "../prisma/client.js";

const router = Router();

router.post("/forgot", async (req, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email requis" });
      return;
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.json({ message: "Si cet email existe, un lien de réinitialisation vous a été envoyé." });
      return;
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000);
    await prisma.resetToken.create({ data: { email, token, expiresAt } });
    const resetLink = `${req.protocol}://${req.get("host")}/reset-password?token=${token}`;
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "info",
        title: "Réinitialisation de mot de passe",
        message: `Cliquez sur ce lien pour réinitialiser votre mot de passe (valable 1h) : ${resetLink}`,
        link: `/reset-password?token=${token}`,
      },
    });
    res.json({ message: "Un lien de réinitialisation a été envoyé à votre adresse email et dans vos notifications." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/reset", async (req, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(400).json({ error: "Token et mot de passe requis" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères" });
      return;
    }
    const resetToken = await prisma.resetToken.findUnique({ where: { token } });
    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      res.status(400).json({ error: "Token invalide ou expiré" });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { email: resetToken.email }, data: { password: hashed } });
    await prisma.resetToken.update({ where: { id: resetToken.id }, data: { used: true } });
    res.json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
