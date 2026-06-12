import { Router, Response } from "express";
import prisma from "../prisma/client.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { targetId, targetType, reason, description } = req.body;
    if (!targetId || !reason) {
      res.status(400).json({ error: "targetId et reason requis" });
      return;
    }
    const report = await prisma.report.create({
      data: { reporterId: req.userId!, targetId, targetType: targetType || "user", reason, description },
    });
    res.status(201).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/", authMiddleware, async (_req: AuthRequest, res: Response) => {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { reporter: { select: { id: true, username: true } } },
    });
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/:id/resolve", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const report = await prisma.report.update({
      where: { id },
      data: { status: status || "resolved" },
    });
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
