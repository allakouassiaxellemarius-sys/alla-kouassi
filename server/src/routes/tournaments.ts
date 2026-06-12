import { Router, Response } from "express";
import prisma from "../prisma/client.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();

function pid(p: string | string[] | undefined): string {
  return Array.isArray(p) ? p[0] : p || "";
}

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { search, game, level, region, status, format, sort } = req.query;
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: pid(search as string), mode: "insensitive" } },
        { description: { contains: pid(search as string), mode: "insensitive" } },
      ];
    }
    if (game) where.game = { equals: pid(game as string), mode: "insensitive" };
    if (level && level !== "all") where.level = pid(level as string);
    if (region) where.region = { equals: pid(region as string), mode: "insensitive" };
    if (status) where.status = pid(status as string);
    if (format) where.format = pid(format as string);
    const orderBy: any = sort === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" };
    const tournaments = await prisma.tournament.findMany({
      where,
      orderBy,
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
    const { name, description, game, maxTeams, minTeams, prizePool, startDate, format, rules, level, region, matchDuration, pointsForWin, pointsForDraw, pointsForLoss, allowDraw, registrationType } = req.body;
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
        level: level || "all",
        region,
        matchDuration: matchDuration ? parseInt(matchDuration) : null,
        pointsForWin: parseInt(pointsForWin) || 3,
        pointsForDraw: parseInt(pointsForDraw) || 1,
        pointsForLoss: parseInt(pointsForLoss) || 0,
        allowDraw: allowDraw === true || allowDraw === "true",
        registrationType: registrationType || "auto",
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
    const memberCount = await prisma.teamMember.count({ where: { teamId } });
    if (memberCount < 1) {
      res.status(400).json({ error: "L'équipe doit avoir au moins 1 membre" });
      return;
    }
    const isOrganizer = await prisma.tournamentOrganizer.findFirst({
      where: { tournamentId: id, userId: req.userId },
    });
    if (isOrganizer) {
      res.status(403).json({ error: "Un organisateur ne peut pas participer à son propre tournoi" });
      return;
    }
    const teamMemberIds = (await prisma.teamMember.findMany({
      where: { teamId },
      select: { userId: true },
    })).map(m => m.userId);
    const orgConflict = await prisma.tournamentOrganizer.findFirst({
      where: { tournamentId: id, userId: { in: teamMemberIds } },
    });
    if (orgConflict) {
      res.status(403).json({ error: "Un membre de cette équipe est organisateur du tournoi" });
      return;
    }
    const approvalStatus = tournament.registrationType === "manual" ? "pending" : "approved";
    const registration = await prisma.tournamentTeam.create({
      data: { teamId, tournamentId: id, approvalStatus },
      include: { team: true },
    });
    const orgs = await prisma.tournamentOrganizer.findMany({ where: { tournamentId: id } });
    for (const org of orgs) {
      await prisma.notification.create({
        data: {
          userId: org.userId,
          type: "registration",
          title: "Nouvelle inscription",
          message: tournament.registrationType === "manual"
            ? `${registration.team.name} souhaite s'inscrire au tournoi ${tournament.name} - en attente d'approbation`
            : `${registration.team.name} s'est inscrit au tournoi ${tournament.name}`,
          link: `/tournaments/${id}`,
          tournamentId: id,
        },
      });
    }
    if (approvalStatus === "pending") {
      res.status(201).json(registration);
      return;
    }
    const newCount = teamsCount + 1;
    if (newCount >= tournament.maxTeams && tournament.status === "upcoming") {
      const allTeams = await prisma.tournamentTeam.findMany({ where: { tournamentId: id } });
      const shuffled = [...allTeams].sort(() => Math.random() - 0.5);
      const matchData: any[] = [];
      let mi = 0;
      for (let j = 0; j < shuffled.length; j += 2) {
        if (j + 1 < shuffled.length) {
          matchData.push({ tournamentId: id, round: 1, matchIndex: mi++, team1Id: shuffled[j].teamId, team2Id: shuffled[j + 1].teamId, status: "scheduled" });
        } else {
          matchData.push({ tournamentId: id, round: 1, matchIndex: mi++, team1Id: shuffled[j].teamId, status: "scheduled" });
        }
      }
      await prisma.match.createMany({ data: matchData });
      await prisma.tournament.update({ where: { id }, data: { status: "ongoing" } });
      await createMatchNotifications(id);
    }
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

router.post("/:id/unregister", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = pid(req.params.id);
    const { teamId } = req.body;
    if (!teamId) {
      res.status(400).json({ error: "ID de l'équipe requis" });
      return;
    }
    const member = await prisma.teamMember.findFirst({
      where: { userId: req.userId, teamId },
    });
    if (!member) {
      res.status(403).json({ error: "Vous n'êtes pas membre de cette équipe" });
      return;
    }
    const registration = await prisma.tournamentTeam.findFirst({
      where: { teamId, tournamentId: id },
    });
    if (!registration) {
      res.status(404).json({ error: "Inscription non trouvée" });
      return;
    }
    await prisma.tournamentTeam.delete({ where: { id: registration.id } });
    res.json({ message: "Désinscription réussie" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/:id/approve-team", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = pid(req.params.id);
    const { teamId } = req.body;
    const isOrganizer = await prisma.tournamentOrganizer.findFirst({
      where: { tournamentId: id, userId: req.userId },
    });
    if (!isOrganizer) {
      res.status(403).json({ error: "Seul un organisateur peut approuver les inscriptions" });
      return;
    }
    const tt = await prisma.tournamentTeam.findFirst({
      where: { teamId, tournamentId: id },
      include: { team: true },
    });
    if (!tt) {
      res.status(404).json({ error: "Inscription non trouvée" });
      return;
    }
    await prisma.tournamentTeam.update({ where: { id: tt.id }, data: { approvalStatus: "approved" } });
    const members = await prisma.teamMember.findMany({ where: { teamId }, select: { userId: true } });
    for (const m of members) {
      await prisma.notification.create({
        data: {
          userId: m.userId,
          type: "info",
          title: "Inscription approuvée",
          message: `${tt.team.name} a été approuvé pour le tournoi`,
          link: `/tournaments/${id}`,
          tournamentId: id,
        },
      });
    }
    res.json({ message: "Équipe approuvée" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/:id/reject-team", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = pid(req.params.id);
    const { teamId } = req.body;
    const isOrganizer = await prisma.tournamentOrganizer.findFirst({
      where: { tournamentId: id, userId: req.userId },
    });
    if (!isOrganizer) {
      res.status(403).json({ error: "Seul un organisateur peut refuser les inscriptions" });
      return;
    }
    const tt = await prisma.tournamentTeam.findFirst({
      where: { teamId, tournamentId: id },
      include: { team: true },
    });
    if (!tt) {
      res.status(404).json({ error: "Inscription non trouvée" });
      return;
    }
    await prisma.tournamentTeam.delete({ where: { id: tt.id } });
    const members = await prisma.teamMember.findMany({ where: { teamId }, select: { userId: true } });
    for (const m of members) {
      await prisma.notification.create({
        data: {
          userId: m.userId,
          type: "info",
          title: "Inscription refusée",
          message: `${tt.team.name} n'a pas été retenu pour le tournoi`,
          link: `/tournaments/${id}`,
          tournamentId: id,
        },
      });
    }
    res.json({ message: "Inscription refusée" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/:id/spectate", async (req: AuthRequest, res: Response) => {
  try {
    const id = pid(req.params.id);
    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) {
      res.status(404).json({ error: "Match non trouvé" });
      return;
    }
    await prisma.match.update({ where: { id }, data: { spectatorCount: { increment: 1 } } });
    res.json({ spectatorCount: (match.spectatorCount || 0) + 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

async function createMatchNotifications(tournamentId: string) {
  const matches = await prisma.match.findMany({
    where: { tournamentId },
    include: {
      tournament: { select: { name: true } },
    },
  });
  for (const m of matches) {
    const teamIds = [m.team1Id, m.team2Id].filter(Boolean) as string[];
    for (const teamId of teamIds) {
      const members = await prisma.teamMember.findMany({
        where: { teamId },
        select: { userId: true },
      });
      for (const member of members) {
        const opponentId = teamId === m.team1Id ? m.team2Id : m.team1Id;
        const opponent = opponentId
          ? await prisma.team.findUnique({ where: { id: opponentId }, select: { name: true } })
          : null;
        await prisma.notification.create({
          data: {
            userId: member.userId,
            type: "match",
            title: "Match à venir",
            message: `Match Round ${m.round} : ${opponent ? "vs " + opponent.name : "en attente d'adversaire"} dans ${m.tournament.name}`,
            link: `/tournaments/${tournamentId}`,
            tournamentId,
          },
        });
      }
    }
  }
}

async function createBadgesForCompletedMatch(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      tournament: { select: { id: true, name: true } },
    },
  });
  if (!match || !match.winnerId) return;
  const winnerMembers = await prisma.teamMember.findMany({
    where: { teamId: match.winnerId },
    select: { userId: true },
  });
  for (const member of winnerMembers) {
    const existing = await prisma.badge.count({
      where: { userId: member.userId, type: "match_winner" },
    });
    await prisma.badge.create({
      data: {
        userId: member.userId,
        matchId: match.id,
        type: "match_winner",
        name: "Victoire en match",
        description: `A gagné le match #${match.matchIndex + 1} du tournoi ${match.tournament.name}`,
        icon: "⚔️",
      },
    });
  }
  const nextRoundMatch = await prisma.match.findFirst({
    where: { tournamentId: match.tournamentId, round: match.round + 1 },
    orderBy: { matchIndex: "asc" },
  });
  if (!nextRoundMatch) {
    for (const member of winnerMembers) {
      await prisma.badge.create({
        data: {
          userId: member.userId,
          matchId: match.id,
          type: "tournament_winner",
          name: "Champion du tournoi",
          description: `A remporté le tournoi ${match.tournament.name}`,
          icon: "🏆",
        },
      });
    }
  }
}

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
    await prisma.tournament.update({ where: { id }, data: { status: "ongoing" } });
    await createMatchNotifications(id);
    const matchesCount = await prisma.match.count({ where: { tournamentId: id } });
    res.json({ message: "Brackets générés", matches: matchesCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/:id/send-instructions", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = pid(req.params.id);
    const { subject, message } = req.body;
    if (!subject || !message) {
      res.status(400).json({ error: "subject et message requis" });
      return;
    }
    const isOrganizer = await prisma.tournamentOrganizer.findFirst({
      where: { tournamentId: id, userId: req.userId },
    });
    if (!isOrganizer) {
      res.status(403).json({ error: "Seul un organisateur peut envoyer des consignes" });
      return;
    }
    const tournament = await prisma.tournament.findUnique({ where: { id } });
    const teams = await prisma.tournamentTeam.findMany({
      where: { tournamentId: id },
      include: { team: { include: { members: { select: { userId: true } } } } },
    });
    const userIds = new Set<string>();
    for (const tt of teams) {
      for (const m of tt.team.members) userIds.add(m.userId);
    }
    for (const uid of userIds) {
      await prisma.notification.create({
        data: {
          userId: uid,
          type: "instruction",
          title: subject,
          message,
          link: `/tournaments/${id}`,
          tournamentId: id,
        },
      });
    }
    res.json({ message: `Consigne envoyée à ${userIds.size} participant(s)` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/:id/close", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = pid(req.params.id);
    const isOrganizer = await prisma.tournamentOrganizer.findFirst({
      where: { tournamentId: id, userId: req.userId },
    });
    if (!isOrganizer) {
      res.status(403).json({ error: "Seul un organisateur peut clôturer le tournoi" });
      return;
    }
    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (tournament?.status === "completed") {
      res.status(400).json({ error: "Tournoi déjà terminé" });
      return;
    }
    await prisma.tournament.update({
      where: { id },
      data: { status: "completed", endDate: new Date() },
    });
    const teams = await prisma.tournamentTeam.findMany({
      where: { tournamentId: id },
      include: { team: { include: { members: { select: { userId: true } } } } },
    });
    const userIds = new Set<string>();
    for (const tt of teams) {
      for (const m of tt.team.members) userIds.add(m.userId);
    }
    for (const uid of userIds) {
      await prisma.notification.create({
        data: {
          userId: uid,
          type: "info",
          title: "Tournoi clôturé",
          message: `Le tournoi ${tournament?.name} a été clôturé par l'organisateur`,
          link: `/tournaments/${id}`,
          tournamentId: id,
        },
      });
    }
    res.json({ message: "Tournoi clôturé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = pid(req.params.id);
    const isOrganizer = await prisma.tournamentOrganizer.findFirst({
      where: { tournamentId: id, userId },
    });
    if (!isOrganizer) {
      res.status(403).json({ error: "Seul un organisateur peut modifier le tournoi" });
      return;
    }
    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (!tournament) {
      res.status(404).json({ error: "Tournoi non trouvé" });
      return;
    }
    const { name, description, game, maxTeams, minTeams, prizePool, startDate, format, rules, level, region, matchDuration, pointsForWin, pointsForDraw, pointsForLoss, allowDraw, registrationType } = req.body;
    const updated = await prisma.tournament.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(game !== undefined && { game }),
        ...(maxTeams !== undefined && { maxTeams: parseInt(maxTeams) || 16 }),
        ...(minTeams !== undefined && { minTeams: parseInt(minTeams) || 2 }),
        ...(prizePool !== undefined && { prizePool }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(format !== undefined && { format }),
        ...(rules !== undefined && { rules }),
        ...(level !== undefined && { level }),
        ...(region !== undefined && { region }),
        ...(matchDuration !== undefined && { matchDuration: matchDuration ? parseInt(matchDuration) : null }),
        ...(pointsForWin !== undefined && { pointsForWin: parseInt(pointsForWin) || 3 }),
        ...(pointsForDraw !== undefined && { pointsForDraw: parseInt(pointsForDraw) || 1 }),
        ...(pointsForLoss !== undefined && { pointsForLoss: parseInt(pointsForLoss) || 0 }),
        ...(allowDraw !== undefined && { allowDraw: allowDraw === true || allowDraw === "true" }),
        ...(registrationType !== undefined && { registrationType }),
      },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = pid(req.params.id);
    const isOrganizer = await prisma.tournamentOrganizer.findFirst({
      where: { tournamentId: id, userId },
    });
    if (!isOrganizer) {
      res.status(403).json({ error: "Seul un organisateur peut supprimer le tournoi" });
      return;
    }
    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (!tournament) {
      res.status(404).json({ error: "Tournoi non trouvé" });
      return;
    }
    await prisma.$transaction(async (tx) => {
      await tx.badge.deleteMany({ where: { match: { tournamentId: id } } });
      await tx.matchPlayer.deleteMany({ where: { match: { tournamentId: id } } });
      await tx.dispute.deleteMany({ where: { tournamentId: id } });
      await tx.notification.deleteMany({ where: { tournamentId: id } });
      await tx.match.deleteMany({ where: { tournamentId: id } });
      await tx.tournamentTeam.deleteMany({ where: { tournamentId: id } });
      await tx.tournamentOrganizer.deleteMany({ where: { tournamentId: id } });
      await tx.tournament.delete({ where: { id } });
    });
    res.json({ message: "Tournoi supprimé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
