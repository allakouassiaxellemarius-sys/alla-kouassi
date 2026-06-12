import { Router, Response } from "express";
import prisma from "../prisma/client.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();

function pid(p: string | string[] | undefined): string {
  return Array.isArray(p) ? p[0] : p || "";
}

router.get("/", async (_req, res: Response) => {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { createdAt: "desc" },
    });
    const result = await Promise.all(
      teams.map(async (t) => {
        const members = await prisma.teamMember.findMany({
          where: { teamId: t.id },
          include: { user: { select: { id: true, username: true } } },
        });
        const membersCount = await prisma.teamMember.count({ where: { teamId: t.id } });
        return { ...t, members, _count: { members: membersCount } };
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
    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
      res.status(404).json({ error: "Équipe non trouvée" });
      return;
    }
    const members = await prisma.teamMember.findMany({
      where: { teamId: id },
      include: { user: { select: { id: true, username: true, avatar: true } } },
    });
    const tournaments = await prisma.tournamentTeam.findMany({
      where: { teamId: id },
      include: { tournament: true },
    });
    res.json({ ...team, members, tournaments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, tag, description } = req.body;
    if (!name || !tag) {
      res.status(400).json({ error: "Nom et tag de l'équipe requis" });
      return;
    }
    const existing = await prisma.team.findUnique({ where: { name } });
    if (existing) {
      res.status(409).json({ error: "Ce nom d'équipe est déjà pris" });
      return;
    }
    const team = await prisma.team.create({
      data: {
        name,
        tag,
        description,
        members: { create: { userId: req.userId!, role: "captain" } },
      },
    });
    const members = await prisma.teamMember.findMany({
      where: { teamId: team.id },
      include: { user: { select: { id: true, username: true } } },
    });
    res.status(201).json({ ...team, members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/:id/join", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = pid(req.params.id);
    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
      res.status(404).json({ error: "Équipe non trouvée" });
      return;
    }
    const existingMembers = await prisma.teamMember.findMany({ where: { teamId: id } });
    const alreadyMember = existingMembers.some((m) => m.userId === req.userId);
    if (alreadyMember) {
      res.status(409).json({ error: "Vous êtes déjà membre de cette équipe" });
      return;
    }
    const member = await prisma.teamMember.create({
      data: { userId: req.userId!, teamId: id },
      include: { user: { select: { id: true, username: true } } },
    });
    res.status(201).json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
