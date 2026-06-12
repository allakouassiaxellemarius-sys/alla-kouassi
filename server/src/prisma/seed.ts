import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      username: "admin",
      password,
      role: "admin",
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: "user1@example.com" },
    update: {},
    create: {
      email: "user1@example.com",
      username: "ProGamer",
      password,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "user2@example.com" },
    update: {},
    create: {
      email: "user2@example.com",
      username: "StormPlayer",
      password,
    },
  });

  const team1 = await prisma.team.upsert({
    where: { name: "Team Alpha" },
    update: {},
    create: {
      name: "Team Alpha",
      tag: "ALPHA",
      description: "La meilleure équipe de la région",
      members: {
        create: [
          { userId: user1.id, role: "captain" },
          { userId: user2.id, role: "member" },
        ],
      },
    },
  });

  const tournament = await prisma.tournament.upsert({
    where: { id: "demo-tournament" },
    update: {},
    create: {
      id: "demo-tournament",
      name: "Championnat d'Été 2026",
      description: "Le plus grand tournoi de l'année !",
      game: "League of Legends",
      maxTeams: 8,
      prizePool: "1000€",
      format: "single_elimination",
      status: "upcoming",
      startDate: new Date("2026-07-01"),
      organizers: { create: { userId: admin.id } },
    },
  });

  console.log("Seed data created successfully");
  console.log(`Admin: admin@example.com / password123`);
  console.log(`Users: user1@example.com / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
