import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

interface DashboardProps {
  user: { id: string; username: string } | null;
}

export default function Dashboard({ user }: DashboardProps) {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    api.tournaments.list().then(setTournaments).catch(() => {});
    api.teams.list().then(setTeams).catch(() => {});
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Bienvenue, {user.username}
      </h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Tournois récents</h2>
            <Link to="/tournaments" className="text-purple-400 hover:text-purple-300 text-sm">
              Voir tout
            </Link>
          </div>
          {tournaments.length === 0 ? (
            <p className="text-gray-500">Aucun tournoi pour le moment</p>
          ) : (
            <div className="space-y-3">
              {tournaments.slice(0, 5).map((t) => (
                <Link
                  key={t.id}
                  to={`/tournaments/${t.id}`}
                  className="block bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition"
                >
                  <div className="font-medium">{t.name}</div>
                  <div className="text-sm text-gray-400">
                    {t.game} • {t._count?.teams || 0} équipes • {t.status}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Mes équipes</h2>
            <Link to="/teams" className="text-purple-400 hover:text-purple-300 text-sm">
              Voir tout
            </Link>
          </div>
          {teams.length === 0 ? (
            <p className="text-gray-500">Vous n'êtes dans aucune équipe</p>
          ) : (
            <div className="space-y-3">
              {teams.slice(0, 5).map((t) => (
                <Link
                  key={t.id}
                  to={`/teams/${t.id}`}
                  className="block bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition"
                >
                  <div className="font-medium">{t.name}</div>
                  <div className="text-sm text-gray-400">
                    [{t.tag}] • {t._count?.members || 0} membres
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
