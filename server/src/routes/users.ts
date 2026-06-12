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
      select: { id: true, username: true, avatar: true, bio: true, country: true },
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
        const matchWins = await prisma.badge.count({ where: { userId: u.id, type: "match_winner" } });
        const tournamentWins = await prisma.badge.count({ where: { userId: u.id, type: "tournament_winner" } });
        const badges = matchWins + tournamentWins;
        const totalPoints = memberships.reduce((sum, tm) => sum + tm.team.tournaments.reduce((ts, t) => ts + (t as any).points || 0, 0), 0);
        return { id: u.id, username: u.username, avatar: u.avatar, bio: u.bio, country: u.country, tournamentsPlayed, badges, tournamentWins, matchWins, totalPoints };
      })
    );
    leaderboard.sort((a, b) => b.tournamentWins - a.tournamentWins || b.badges - a.badges || b.tournamentsPlayed - a.tournamentsPlayed);
    res.json(leaderboard.slice(0, 50));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { username, bio, country, twitter, discord } = req.body;
    const data: any = {};
    if (username !== undefined) data.username = username;
    if (bio !== undefined) data.bio = bio;
    if (country !== undefined) data.country = country;
    if (twitter !== undefined) data.twitter = twitter;
    if (discord !== undefined) data.discord = discord;
    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: { id: true, username: true, email: true, avatar: true, bio: true, country: true, twitter: true, discord: true },
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, username: true, email: true, avatar: true, bio: true, country: true, twitter: true, discord: true, role: true, createdAt: true },
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

router.get("/:id", async (req, res: Response) => {
  try {
    const id = pid(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, avatar: true, bio: true, country: true, twitter: true, discord: true, createdAt: true },
    });
    if (!user) {
      res.status(404).json({ error: "Utilisateur non trouvé" });
      return;
    }
    const teams = await prisma.teamMember.findMany({
      where: { userId: id },
      include: {
        team: {
          select: { id: true, name: true, tag: true, logo: true },
        },
      },
    });
    const badges = await prisma.badge.findMany({ where: { userId: id }, orderBy: { earnedAt: "desc" } });
    const matchWins = await prisma.badge.count({ where: { userId: id, type: "match_winner" } });
    const tournamentWins = await prisma.badge.count({ where: { userId: id, type: "tournament_winner" } });
    res.json({ ...user, teams, badges, matchWins, tournamentWins, matchesPlayed: matchWins + await prisma.matchPlayer.count({ where: { userId: id } }) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
