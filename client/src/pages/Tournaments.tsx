import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

export default function Tournaments() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.tournaments
      .list()
      .then(setTournaments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16 text-gray-400">Chargement...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Tournois</h1>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((t) => (
          <Link
            key={t.id}
            to={`/tournaments/${t.id}`}
            className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-purple-700 transition group"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    t.status === "ongoing"
                      ? "bg-green-900/50 text-green-400"
                      : t.status === "completed"
                      ? "bg-blue-900/50 text-blue-400"
                      : "bg-yellow-900/50 text-yellow-400"
                  }`}
                >
                  {t.status === "ongoing"
                    ? "En cours"
                    : t.status === "completed"
                    ? "Terminé"
                    : "À venir"}
                </span>
                {t.prizePool && (
                  <span className="text-yellow-500 font-semibold">{t.prizePool}</span>
                )}
              </div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition">
                {t.name}
              </h2>
              {t.game && <p className="text-gray-400 text-sm mb-3">{t.game}</p>}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{t._count?.teams || 0}/{t.maxTeams} équipes</span>
                <span>{t.format === "single_elimination" ? "Élimination directe" : t.format}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
