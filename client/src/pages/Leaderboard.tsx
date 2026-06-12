import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

interface LeaderboardUser {
  id: string;
  username: string;
  avatar?: string;
  tournamentsPlayed: number;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.users
      .leaderboard()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16 text-gray-400">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Classement</h1>
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-800/50 text-sm text-gray-400 font-medium">
          <div className="col-span-1">#</div>
          <div className="col-span-8">Joueur</div>
          <div className="col-span-3 text-right">Tournois joués</div>
        </div>
        <div className="divide-y divide-gray-800">
          {users.map((u, i) => (
            <Link
              key={u.id}
              to={`/profile/${u.id}`}
              className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-800/30 transition"
            >
              <div className="col-span-1">
                {i === 0 ? (
                  <span className="text-yellow-500 text-lg">🥇</span>
                ) : i === 1 ? (
                  <span className="text-gray-400 text-lg">🥈</span>
                ) : i === 2 ? (
                  <span className="text-amber-700 text-lg">🥉</span>
                ) : (
                  <span className="text-gray-600">{i + 1}</span>
                )}
              </div>
              <div className="col-span-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-sm font-bold">
                  {u.username[0].toUpperCase()}
                </div>
                <span className="font-medium">{u.username}</span>
              </div>
              <div className="col-span-3 text-right font-mono text-purple-400">
                {u.tournamentsPlayed}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
