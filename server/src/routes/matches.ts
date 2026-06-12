import { Router, Response } from "express";
import prisma from "../prisma/client.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();

function pid(p: string | string[] | undefined): string {
  return Array.isArray(p) ? p[0] : p || "";
}

async function addLog(matchId: string, event: { action: string; by: string; detail?: string }) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return;
  const logs = JSON.parse(match.log || "[]");
  logs.push({ ...event, at: new Date().toISOString() });
  await prisma.match.update({ where: { id: matchId }, data: { log: JSON.stringify(logs) } });
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
    const userId = req.userId!;
    const id = pid(req.params.id);
    const { score1, score2 } = req.body;
    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) {
      res.status(404).json({ error: "Match non trouvé" });
      return;
    }
    if (match.status === "completed") {
      res.status(400).json({ error: "Match déjà terminé" });
      return;
    }
    const isOrganizer = await prisma.tournamentOrganizer.findFirst({
      where: { tournamentId: match.tournamentId, userId },
    });
    if (isOrganizer) {
      const winnerId = score1 > score2 ? match.team1Id : match.team2Id;
      const updated = await prisma.match.update({
        where: { id },
        data: { score1, score2, winnerId, scoreStatus: "approved", status: "completed", playedAt: new Date(), scoreApprovedBy: userId },
      });
      await addLog(id, { action: "score_approved", by: userId, detail: `${score1}–${score2}` });
      await advanceWinner(match, winnerId);
      await createBadgesForCompletedMatch(match.id);
      res.json(updated);
    } else {
      const member = await prisma.teamMember.findFirst({
        where: { userId, teamId: { in: [match.team1Id, match.team2Id].filter(Boolean) as string[] } },
      });
      if (!member) {
        res.status(403).json({ error: "Vous n'êtes pas dans ce match" });
        return;
      }
      const updated = await prisma.match.update({
        where: { id },
        data: { score1, score2, scoreStatus: "pending", scoreReportedBy: userId },
      });
      await addLog(id, { action: "score_reported", by: userId, detail: `${score1}–${score2}` });
      const orgs = await prisma.tournamentOrganizer.findMany({
        where: { tournamentId: match.tournamentId },
      });
      for (const org of orgs) {
        await prisma.notification.create({
          data: {
            userId: org.userId,
            type: "score",
            title: "Score en attente de validation",
            message: `Un score (${score1}–${score2}) a été signalé pour le match #${match.matchIndex + 1}. Vérifiez et approuvez-le.`,
            link: `/tournaments/${match.tournamentId}`,
            tournamentId: match.tournamentId,
          },
        });
      }
      res.json(updated);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/:id/approve-score", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = pid(req.params.id);
    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) {
      res.status(404).json({ error: "Match non trouvé" });
      return;
    }
    if (match.scoreStatus !== "pending") {
      res.status(400).json({ error: "Score déjà traité" });
      return;
    }
    const isOrganizer = await prisma.tournamentOrganizer.findFirst({
      where: { tournamentId: match.tournamentId, userId },
    });
    if (!isOrganizer) {
      res.status(403).json({ error: "Seul un organisateur peut approuver" });
      return;
    }
    const winnerId = (match.score1 ?? 0) > (match.score2 ?? 0) ? match.team1Id : match.team2Id;
    const updated = await prisma.match.update({
      where: { id },
      data: { winnerId, scoreStatus: "approved", status: "completed", playedAt: new Date(), scoreApprovedBy: userId },
    });
    await addLog(id, { action: "score_approved", by: userId, detail: `${match.score1}–${match.score2}` });
    const reporter = match.scoreReportedBy
      ? await prisma.user.findUnique({ where: { id: match.scoreReportedBy }, select: { username: true } })
      : null;
    if (match.scoreReportedBy) {
      await prisma.notification.create({
        data: {
          userId: match.scoreReportedBy,
          type: "score",
          title: "Score validé",
          message: `Votre score (${match.score1}–${match.score2}) a été validé par l'organisateur.`,
          link: `/tournaments/${match.tournamentId}`,
          tournamentId: match.tournamentId,
        },
      });
    }
    await advanceWinner(match, winnerId);
    await createBadgesForCompletedMatch(match.id);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/:id/contact-organizer", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = pid(req.params.id);
    const { message } = req.body;
    if (!message?.trim()) {
      res.status(400).json({ error: "Message requis" });
      return;
    }
    const match = await prisma.match.findUnique({ where: { id }, include: { tournament: { select: { name: true } } } });
    if (!match) {
      res.status(404).json({ error: "Match non trouvé" });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
    const orgs = await prisma.tournamentOrganizer.findMany({ where: { tournamentId: match.tournamentId } });
    for (const org of orgs) {
      await prisma.notification.create({
        data: {
          userId: org.userId,
          type: "contact",
          title: `Message de ${user?.username || "un joueur"}`,
          message: `À propos du match #${match.matchIndex + 1} (${match.tournament.name}) : ${message}`,
          link: `/tournaments/${match.tournamentId}`,
          tournamentId: match.tournamentId,
        },
      });
    }
    await addLog(id, { action: "contact_organizer", by: userId, detail: message });
    res.json({ message: "Message envoyé à l'organisateur" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/:id/remind-score", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = pid(req.params.id);
    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) {
      res.status(404).json({ error: "Match non trouvé" });
      return;
    }
    if (match.status === "completed") {
      res.status(400).json({ error: "Match déjà terminé" });
      return;
    }
    const teamIds = [match.team1Id, match.team2Id].filter(Boolean) as string[];
    for (const teamId of teamIds) {
      const members = await prisma.teamMember.findMany({
        where: { teamId },
        select: { userId: true },
      });
      for (const member of members) {
        await prisma.notification.create({
          data: {
            userId: member.userId,
            type: "reminder",
            title: "Rappel : score à envoyer",
            message: `Le match #${match.matchIndex + 1} est en attente de votre résultat. Merci de le signaler dès que possible.`,
            link: `/tournaments/${match.tournamentId}`,
            tournamentId: match.tournamentId,
          },
        });
      }
    }
    await addLog(id, { action: "score_reminder_sent", by: userId });
    res.json({ message: "Rappel envoyé aux équipes" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/:id/delay", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = pid(req.params.id);
    const { reason } = req.body;
    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) {
      res.status(404).json({ error: "Match non trouvé" });
      return;
    }
    const member = await prisma.teamMember.findFirst({
      where: { userId, teamId: { in: [match.team1Id, match.team2Id].filter(Boolean) as string[] } },
    });
    if (!member) {
      res.status(403).json({ error: "Vous n'êtes pas dans ce match" });
      return;
    }
    const updated = await prisma.match.update({
      where: { id },
      data: { delayed: true, delayReason: reason || "Retard signalé", delayReportedBy: userId },
    });
    await addLog(id, { action: "delay_reported", by: userId, detail: reason || undefined });
    const orgs = await prisma.tournamentOrganizer.findMany({
      where: { tournamentId: match.tournamentId },
    });
    for (const org of orgs) {
      await prisma.notification.create({
        data: {
          userId: org.userId,
          type: "urgent",
          title: "🚨 Retard signalé - Urgent",
          message: `Un joueur a signalé un retard sur le match #${match.matchIndex + 1} : ${reason || "Aucune raison"}. Action requise.`,
          link: `/tournaments/${match.tournamentId}`,
          tournamentId: match.tournamentId,
        },
      });
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/:id/forfeit", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = pid(req.params.id);
    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) {
      res.status(404).json({ error: "Match non trouvé" });
      return;
    }
    if (match.status === "completed") {
      res.status(400).json({ error: "Match déjà terminé" });
      return;
    }
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId, teamId: { in: [match.team1Id, match.team2Id].filter(Boolean) as string[] } },
    });
    if (!teamMember) {
      res.status(403).json({ error: "Vous n'êtes pas dans ce match" });
      return;
    }
    const forfeitingTeamId = teamMember.teamId;
    const winnerId = forfeitingTeamId === match.team1Id ? match.team2Id : match.team1Id;
    if (!winnerId) {
      res.status(400).json({ error: "Impossible de déclarer forfait, adversaire inconnu" });
      return;
    }
    const score1 = forfeitingTeamId === match.team1Id ? 0 : 1;
    const score2 = forfeitingTeamId === match.team1Id ? 1 : 0;
    const updated = await prisma.match.update({
      where: { id },
      data: { score1, score2, winnerId, scoreStatus: "approved", status: "completed", playedAt: new Date() },
    });
    await addLog(id, { action: "forfeit", by: userId });
    await advanceWinner(match, winnerId);
    await createBadgesForCompletedMatch(match.id);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

async function advanceWinner(match: any, winnerId: string | null) {
  if (!winnerId) return;
  const nextMatch = await prisma.match.findFirst({
    where: { tournamentId: match.tournamentId, round: match.round + 1 },
    orderBy: { matchIndex: "asc" },
  });
  if (nextMatch) {
    if (!nextMatch.team1Id) {
      await prisma.match.update({ where: { id: nextMatch.id }, data: { team1Id: winnerId } });
    } else if (!nextMatch.team2Id) {
      await prisma.match.update({ where: { id: nextMatch.id }, data: { team2Id: winnerId } });
    } else {
      const extraMatch = await prisma.match.findFirst({
        where: { tournamentId: match.tournamentId, round: match.round + 1, matchIndex: nextMatch.matchIndex + 1 },
      });
      if (extraMatch) {
        await prisma.match.update({ where: { id: extraMatch.id }, data: { team1Id: winnerId } });
      }
    }
  } else {
    await prisma.tournament.update({
      where: { id: match.tournamentId },
      data: { status: "completed", endDate: new Date() },
    });
  }
}

async function createBadgesForCompletedMatch(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { tournament: { select: { id: true, name: true } } },
  });
  if (!match || !match.winnerId) return;
  const winnerMembers = await prisma.teamMember.findMany({
    where: { teamId: match.winnerId },
    select: { userId: true },
  });
  for (const member of winnerMembers) {
    const count = await prisma.badge.count({ where: { userId: member.userId, type: "match_winner" } });
    if (count > 0) continue;
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
  const nextRoundExists = await prisma.match.findFirst({
    where: { tournamentId: match.tournamentId, round: match.round + 1 },
  });
  if (!nextRoundExists) {
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

export default router;
