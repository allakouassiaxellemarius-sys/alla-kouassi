import { Router, Response } from "express";
import prisma from "../prisma/client.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();

function pid(p: string | string[] | undefined): string {
  return Array.isArray(p) ? p[0] : p || "";
}

router.get("/", async (_req, res: Response) => {
  try {
    const tournaments = await prisma.tournament.findMany({
      orderBy: { createdAt: "desc" },
    });
    const result = await Promise.all(
      tournaments.map(async (t) => {
        const organizers = await prisma.tournamentOrganizer.findMany({
          where: { tournamentId: t.id },
          include: { user: { select: { username: true } } },
        });
        const teamsCount = await prisma.tournamentTeam.count({ where: { tournamentId: t.id } });
        const matchesCount = await prisma.match.count({ where: { tournamentId: t.id } });
        return { ...t, organizers, _count: { teams: teamsCount, matches: matchesCount } };
      })
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const id = pid(req.params.id);
    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (!tournament) {
      res.status(404).json({ error: "Tournoi non trouvé" });
      return;
    }
    const organizers = await prisma.tournamentOrganizer.findMany({
      where: { tournamentId: id },
      include: { user: { select: { id: true, username: true } } },
    });
    const teams = await prisma.tournamentTeam.findMany({
      where: { tournamentId: id },
      include: {
        team: {
          include: {
            members: { include: { user: { select: { id: true, username: true } } } },
          },
        },
      },
    });
    const matches = await prisma.match.findMany({
      where: { tournamentId: id },
      orderBy: [{ round: "asc" }, { matchIndex: "asc" }],
    });
    res.json({ ...tournament, organizers, teams, matches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, game, maxTeams, minTeams, prizePool, startDate, format, rules } = req.body;
    if (!name) {
      res.status(400).json({ error: "Le nom du tournoi est requis" });
      return;
    }
    const tournament = await prisma.tournament.create({
      data: {
        name,
        description,
        game,
        maxTeams: maxTeams || 16,
        minTeams: minTeams || 2,
        prizePool,
        startDate: startDate ? new Date(startDate) : null,
        format: format || "single_elimination",
        rules,
        organizers: { create: { userId: req.userId! } },
      },
    });
    const organizers = await prisma.tournamentOrganizer.findMany({
      where: { tournamentId: tournament.id },
      include: { user: { select: { username: true } } },
    });
    res.status(201).json({ ...tournament, organizers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/:id/register", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = pid(req.params.id);
    const { teamId } = req.body;
    if (!teamId) {
      res.status(400).json({ error: "ID de l'équipe requis" });
      return;
    }
    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (!tournament) {
      res.status(404).json({ error: "Tournoi non trouvé" });
      return;
    }
    const teamsCount = await prisma.tournamentTeam.count({ where: { tournamentId: id } });
    if (teamsCount >= tournament.maxTeams) {
      res.status(400).json({ error: "Le tournoi est complet" });
      return;
    }
    const existing = await prisma.tournamentTeam.findFirst({
      where: { teamId, tournamentId: id },
    });
    if (existing) {
      res.status(409).json({ error: "Équipe déjà inscrite" });
      return;
    }
    const registration = await prisma.tournamentTeam.create({
      data: { teamId, tournamentId: id },
      include: { team: true },
    });
    res.status(201).json(registration);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/:id/start", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = pid(req.params.id);
    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (!tournament) {
      res.status(404).json({ error: "Tournoi non trouvé" });
      return;
    }
    const organizers = await prisma.tournamentOrganizer.findMany({ where: { tournamentId: id } });
    if (!organizers.some((o) => o.userId === req.userId)) {
      res.status(403).json({ error: "Seul un organisateur peut démarrer le tournoi" });
      return;
    }
    const teams = await prisma.tournamentTeam.findMany({ where: { tournamentId: id }, orderBy: { seed: "asc" } });
    if (teams.length < tournament.minTeams) {
      res.status(400).json({ error: `Minimum ${tournament.minTeams} équipes requises` });
      return;
    }
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    const matches: any[] = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        matches.push({
          tournamentId: id,
          round: 1,
          matchIndex: matches.length,
          team1Id: shuffled[i].teamId,
          team2Id: shuffled[i + 1].teamId,
          status: "scheduled",
        });
      }
    }
    if (shuffled.length % 2 !== 0) {
      matches.push({
        tournamentId: id,
        round: 1,
        matchIndex: matches.length,
        team1Id: shuffled[shuffled.length - 1].teamId,
        status: "scheduled",
      });
    }
    await prisma.match.createMany({ data: matches });
    await prisma.tournament.update({ where: { id }, data: { status: "ongoing" } });
    res.json({ message: "Tournoi démarré", matches: matches.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/:id/generate-brackets", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = pid(req.params.id);
    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (!tournament) {
      res.status(404).json({ error: "Tournoi non trouvé" });
      return;
    }
    const teams = await prisma.tournamentTeam.findMany({ where: { tournamentId: id } });
    if (teams.length < 2) {
      res.status(400).json({ error: "Au moins 2 équipes requises" });
      return;
    }
    await prisma.match.deleteMany({ where: { tournamentId: id } });
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    const numTeams = shuffled.length;
    const totalSlots = Math.pow(2, Math.ceil(Math.log2(numTeams)));
    const byes = totalSlots - numTeams;

    let matchIndex = 0;
    const round1Matches: any[] = [];
    let i = 0;
    while (i < numTeams) {
      if (byes > 0 && i + 1 >= numTeams) {
        round1Matches.push({
          tournamentId: id,
          round: 1,
          matchIndex: matchIndex++,
          team1Id: shuffled[i].teamId,
          status: "scheduled",
        });
        i++;
      } else if (i + 1 < numTeams) {
        round1Matches.push({
          tournamentId: id,
          round: 1,
          matchIndex: matchIndex++,
          team1Id: shuffled[i].teamId,
          team2Id: shuffled[i + 1].teamId,
          status: "scheduled",
        });
        i += 2;
      } else {
        round1Matches.push({
          tournamentId: id,
          round: 1,
          matchIndex: matchIndex++,
          team1Id: shuffled[i].teamId,
          status: "scheduled",
        });
        i++;
      }
    }
    await prisma.match.createMany({ data: round1Matches });
    const matchesCount = await prisma.match.count({ where: { tournamentId: id } });
    res.json({ message: "Brackets générés", matches: matchesCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
