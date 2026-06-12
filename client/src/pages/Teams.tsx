import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

export default function Teams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.teams
      .list()
      .then(setTeams)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16 text-gray-400">Chargement...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Équipes</h1>
        <Link
          to="/teams/create"
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
        >
          Créer une équipe
        </Link>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((t) => (
          <Link
            key={t.id}
            to={`/teams/${t.id}`}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-purple-700 transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold group-hover:text-purple-400 transition">
                {t.name}
              </h2>
              <span className="text-sm font-mono bg-gray-800 text-purple-400 px-2 py-1 rounded">
                {t.tag}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{t._count?.members || 0} membres</span>
            </div>
            {t.members && (
              <div className="mt-3 flex flex-wrap gap-2">
                {t.members.slice(0, 5).map((m: any) => (
                  <span
                    key={m.id}
                    className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded"
                  >
                    {m.user.username}
                    {m.role === "captain" && " (C)"}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
