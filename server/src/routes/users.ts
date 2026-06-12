import { Router, Response } from "express";
import prisma from "../prisma/client.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();

function pid(p: string | string[] | undefined): string {
  return Array.isArray(p) ? p[0] : p || "";
}

router.get("/leaderboard", async (_req, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, avatar: true },
    });
    const leaderboard = await Promise.all(
      users.map(async (u) => {
        const memberships = await prisma.teamMember.findMany({
          where: { userId: u.id },
          include: {
            team: {
              include: {
                tournaments: { where: { tournament: { status: "completed" } } },
              },
            },
          },
        });
        const tournamentsPlayed = memberships.reduce(
          (sum, tm) => sum + tm.team.tournaments.length,
          0
        );
        const badges = await prisma.badge.count({ where: { userId: u.id } });
        const tournamentWins = await prisma.badge.count({ where: { userId: u.id, type: "tournament_winner" } });
        return { id: u.id, username: u.username, avatar: u.avatar, tournamentsPlayed, badges, tournamentWins };
      })
    );
    leaderboard.sort((a, b) => b.tournamentWins - a.tournamentWins || b.tournamentsPlayed - a.tournamentsPlayed);
    res.json(leaderboard.slice(0, 50));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/:id", async (req, res: Response) => {
  try {
    const id = pid(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, avatar: true },
    });
    if (!user) {
      res.status(404).json({ error: "Utilisateur non trouvé" });
      return;
    }
    const teams = await prisma.teamMember.findMany({
      where: { userId: id },
      include: {
        team: { select: { id: true, name: true, tag: true, logo: true } },
      },
    });
    const badges = await prisma.badge.findMany({ where: { userId: id }, orderBy: { earnedAt: "desc" } });
    res.json({ ...user, teams, badges });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
