import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";

export default function TeamDetail() {
  const { id } = useParams();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.teams
        .get(id)
        .then(setTeam)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleJoin = async () => {
    try {
      await api.teams.join(team.id);
      const updated = await api.teams.get(team.id);
      setTeam(updated);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Chargement...</div>;
  if (!team) return <div className="text-center py-16 text-gray-400">Équipe non trouvée</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{team.name}</h1>
            <div className="flex items-center gap-3">
              <span className="font-mono text-purple-400 bg-gray-800 px-3 py-1 rounded">
                {team.tag}
              </span>
              <span className="text-gray-500">{team.members?.length || 0} membres</span>
            </div>
          </div>
          <button
            onClick={handleJoin}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
          >
            Rejoindre
          </button>
        </div>
        {team.description && (
          <p className="text-gray-400 mb-6">{team.description}</p>
        )}
      </div>

      <h2 className="text-xl font-bold mb-4">Membres</h2>
      <div className="space-y-3 mb-8">
        {team.members?.map((m: any) => (
          <div
            key={m.id}
            className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-sm font-bold">
                {m.user.username[0].toUpperCase()}
              </div>
              <div>
                <Link
                  to={`/profile/${m.user.id}`}
                  className="font-medium hover:text-purple-400 transition"
                >
                  {m.user.username}
                </Link>
                <div className="text-xs text-gray-500">
                  {m.role === "captain" ? "Capitaine" : "Membre"}
                </div>
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {m.role === "captain" ? "👑" : ""}
            </span>
          </div>
        ))}
      </div>

      {team.tournaments && team.tournaments.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-4">Tournois</h2>
          <div className="space-y-3">
            {team.tournaments.map((tt: any) => (
              <Link
                key={tt.id}
                to={`/tournaments/${tt.tournament.id}`}
                className="block bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-purple-700 transition"
              >
                <div className="font-medium">{tt.tournament.name}</div>
                <div className="text-sm text-gray-500">
                  Statut: {tt.tournament.status === "ongoing" ? "En cours" : tt.tournament.status === "completed" ? "Terminé" : "À venir"}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
