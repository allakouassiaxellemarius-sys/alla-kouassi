import { Router, Response } from "express";
import prisma from "../prisma/client.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();

function pid(p: string | string[] | undefined): string {
  return Array.isArray(p) ? p[0] : p || "";
}

router.get("/tournament/:tournamentId", async (req: AuthRequest, res: Response) => {
  try {
    const tournamentId = pid(req.params.tournamentId);
    const matches = await prisma.match.findMany({
      where: { tournamentId },
      orderBy: [{ round: "asc" }, { matchIndex: "asc" }],
    });
    const tournaments = await prisma.tournament.findMany({
      where: { id: tournamentId },
      select: { id: true, name: true },
    });
    const tournamentMap = Object.fromEntries(tournaments.map((t) => [t.id, t]));
    const result = matches.map((m) => ({ ...m, tournament: tournamentMap[m.tournamentId] }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/:id/score", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = pid(req.params.id);
    const { score1, score2 } = req.body;
    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) {
      res.status(404).json({ error: "Match non trouvé" });
      return;
    }
    const organizers = await prisma.tournamentOrganizer.findMany({
      where: { tournamentId: match.tournamentId },
    });
    if (!organizers.some((o) => o.userId === req.userId)) {
      res.status(403).json({ error: "Seul un organisateur peut noter ce match" });
      return;
    }
    const winnerId = score1 > score2 ? match.team1Id : match.team2Id;
    const updated = await prisma.match.update({
      where: { id },
      data: {
        score1,
        score2,
        winnerId,
        status: "completed",
        playedAt: new Date(),
      },
    });
    if (winnerId) {
      const nextMatch = await prisma.match.findFirst({
        where: {
          tournamentId: match.tournamentId,
          round: match.round + 1,
        },
        orderBy: { matchIndex: "asc" },
      });
      if (nextMatch) {
        if (!nextMatch.team1Id) {
          await prisma.match.update({
            where: { id: nextMatch.id },
            data: { team1Id: winnerId },
          });
        } else if (!nextMatch.team2Id) {
          await prisma.match.update({
            where: { id: nextMatch.id },
            data: { team2Id: winnerId },
          });
        } else {
          const extraMatch = await prisma.match.findFirst({
            where: {
              tournamentId: match.tournamentId,
              round: match.round + 1,
              matchIndex: nextMatch.matchIndex + 1,
            },
          });
          if (extraMatch) {
            await prisma.match.update({
              where: { id: extraMatch.id },
              data: { team1Id: winnerId },
            });
          }
        }
      } else {
        await prisma.tournament.update({
          where: { id: match.tournamentId },
          data: { status: "completed", endDate: new Date() },
        });
      }
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
