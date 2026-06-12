import { Router, Response } from "express";
import prisma from "../prisma/client.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();

function pid(p: string | string[] | undefined): string {
  return Array.isArray(p) ? p[0] : p || "";
}

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { tournament: { select: { name: true } } },
    });
    const mapped = notifications.map((n: any) => ({
      ...n,
      tournamentName: n.tournament?.name || null,
      tournament: undefined,
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/unread-count", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.userId, read: false },
    });
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/:id/read", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = pid(req.params.id);
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) {
      res.status(404).json({ error: "Notification non trouvée" });
      return;
    }
    await prisma.notification.update({ where: { id }, data: { read: true } });
    res.json({ message: "Marquée comme lue" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/seed", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const notifications = await prisma.notification.createMany({
      data: [
        { userId, type: "info", title: "Bienvenue !", message: "Bienvenue sur la plateforme Compete.gg", link: "/tournaments" },
        { userId, type: "tip", title: "Créez une équipe", message: "Pour participer aux tournois, créez votre équipe", link: "/teams/create" },
      ],
    });
    res.json({ created: notifications.count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
