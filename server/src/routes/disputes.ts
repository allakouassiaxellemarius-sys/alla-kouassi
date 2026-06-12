import { Router, Response } from "express";
import prisma from "../prisma/client.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();

function pid(p: string | string[] | undefined): string {
  return Array.isArray(p) ? p[0] : p || "";
}

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { matchId, tournamentId, reason, details } = req.body;
    if (!matchId || !tournamentId || !reason) {
      res.status(400).json({ error: "matchId, tournamentId et reason requis" });
      return;
    }
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      res.status(404).json({ error: "Match non trouvé" });
      return;
    }
    const dispute = await prisma.dispute.create({
      data: { matchId, tournamentId, reportedBy: userId, reason, details },
    });
    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    const organizers = await prisma.tournamentOrganizer.findMany({
      where: { tournamentId },
    });
    for (const org of organizers) {
      await prisma.notification.create({
        data: {
          userId: org.userId,
          type: "dispute",
          title: "Litige signalé",
          message: `Un litige a été signalé sur le match #${match.matchIndex + 1} du tournoi ${tournament?.name}`,
          link: `/tournaments/${tournamentId}`,
          tournamentId,
        },
      });
    }
    res.status(201).json(dispute);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const tournamentId = req.query.tournamentId as string | undefined;
    const where: any = {};
    if (tournamentId) where.tournamentId = tournamentId;
    const userTournaments = await prisma.tournamentOrganizer.findMany({
      where: { userId: req.userId },
      select: { tournamentId: true },
    });
    const orgIds = userTournaments.map((t) => t.tournamentId);
    if (!tournamentId) {
      where.tournamentId = { in: orgIds };
    } else if (!orgIds.includes(tournamentId)) {
      res.status(403).json({ error: "Accès refusé" });
      return;
    }
    const disputes = await prisma.dispute.findMany({
      where,
      include: { reporter: { select: { id: true, username: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(disputes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/:id/resolve", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = pid(req.params.id);
    const { status, resolution } = req.body;
    const dispute = await prisma.dispute.findUnique({ where: { id } });
    if (!dispute) {
      res.status(404).json({ error: "Litige non trouvé" });
      return;
    }
    const orgs = await prisma.tournamentOrganizer.findMany({
      where: { tournamentId: dispute.tournamentId, userId },
    });
    if (orgs.length === 0) {
      res.status(403).json({ error: "Seul un organisateur peut résoudre ce litige" });
      return;
    }
    const updated = await prisma.dispute.update({
      where: { id },
      data: { status: status || "resolved", resolvedBy: userId, resolution },
    });
    await prisma.notification.create({
      data: {
        userId: dispute.reportedBy,
        type: "dispute",
        title: "Litige résolu",
        message: `Votre litige a été ${status === "resolved" ? "résolu" : "rejeté"}: ${resolution || "Aucune explication"}`,
        link: `/tournaments/${dispute.tournamentId}`,
        tournamentId: dispute.tournamentId,
      },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
