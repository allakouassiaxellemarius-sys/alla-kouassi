import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

interface LeaderboardUser {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
  country?: string;
  tournamentsPlayed: number;
  badges: number;
  tournamentWins: number;
  matchWins: number;
  totalPoints: number;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"wins" | "badges" | "matches" | "points">("wins");

  useEffect(() => {
    api.users
      .leaderboard()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...users].sort((a, b) => {
    if (sortBy === "badges") return b.badges - a.badges;
    if (sortBy === "matches") return b.tournamentsPlayed - a.tournamentsPlayed;
    if (sortBy === "points") return b.totalPoints - a.totalPoints;
    return b.tournamentWins - a.tournamentWins || b.matchWins - a.matchWins;
  });

  if (loading) return <div className="text-center py-16 text-gray-400">Chargement...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Classement</h1>
        <div className="flex gap-2">
          {(["wins", "badges", "matches", "points"] as const).map((s) => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`text-xs px-3 py-1.5 rounded-lg transition ${sortBy === s ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
              {s === "wins" ? "🏆 Victoires" : s === "badges" ? "🏅 Badges" : s === "matches" ? "⚔️ Matchs" : "⭐ Points"}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-800/50 text-sm text-gray-400 font-medium">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Joueur</div>
          <div className="col-span-1 text-center">🏆</div>
          <div className="col-span-1 text-center">⚔️</div>
          <div className="col-span-1 text-center">🏅</div>
          <div className="col-span-2 text-center">⭐ Points</div>
          <div className="col-span-2 text-right">Matchs</div>
        </div>
        <div className="divide-y divide-gray-800">
          {sorted.map((u, i) => (
            <Link key={u.id} to={`/profile/${u.id}`}
              className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-800/30 transition">
              <div className="col-span-1">
                {i === 0 ? <span className="text-yellow-500 text-lg">🥇</span> : i === 1 ? <span className="text-gray-400 text-lg">🥈</span> : i === 2 ? <span className="text-amber-700 text-lg">🥉</span> : <span className="text-gray-600">{i + 1}</span>}
              </div>
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-sm font-bold shrink-0">
                  {u.username[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="font-medium truncate block">{u.username}</span>
                  <span className="text-[10px] text-gray-600">{u.country || ""} {u.tournamentWins > 0 ? `🏆×${u.tournamentWins}` : ""}</span>
                </div>
              </div>
              <div className="col-span-1 text-center font-mono text-yellow-400">{u.tournamentWins || 0}</div>
              <div className="col-span-1 text-center font-mono text-green-400">{u.matchWins || 0}</div>
              <div className="col-span-1 text-center font-mono text-purple-400">{u.badges || 0}</div>
              <div className="col-span-2 text-center font-mono text-amber-400">{u.totalPoints || 0}</div>
              <div className="col-span-2 text-right font-mono text-gray-400">{u.tournamentsPlayed}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
