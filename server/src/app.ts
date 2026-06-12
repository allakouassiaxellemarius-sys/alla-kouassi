import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import tournamentRoutes from "./routes/tournaments.js";
import teamRoutes from "./routes/teams.js";
import matchRoutes from "./routes/matches.js";
import userRoutes from "./routes/users.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Competition Platform API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/users", userRoutes);

export default app;
