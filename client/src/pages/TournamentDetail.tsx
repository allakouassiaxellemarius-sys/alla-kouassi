import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";

export default function TournamentDetail() {
  const { id } = useParams();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.tournaments
        .get(id)
        .then(setTournament)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="text-center py-16 text-gray-400">Chargement...</div>;
  if (!tournament)
    return <div className="text-center py-16 text-gray-400">Tournoi non trouvé</div>;

  const handleGenerateBrackets = async () => {
    if (!confirm("Générer les brackets ? Cela effacera les matchs existants.")) return;
    try {
      await api.tournaments.generateBrackets(tournament.id);
      const updated = await api.tournaments.get(tournament.id);
      setTournament(updated);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRegister = async (teamId: string) => {
    try {
      await api.tournaments.register(tournament.id, teamId);
      const updated = await api.tournaments.get(tournament.id);
      setTournament(updated);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const matchesByRound = (tournament.matches || []).reduce((acc: any, m: any) => {
    if (!acc[m.round]) acc[m.round] = [];
    acc[m.round].push(m);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{tournament.name}</h1>
            <div className="flex items-center gap-4 text-gray-400">
              {tournament.game && <span>{tournament.game}</span>}
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  tournament.status === "ongoing"
                    ? "bg-green-900/50 text-green-400"
                    : tournament.status === "completed"
                    ? "bg-blue-900/50 text-blue-400"
                    : "bg-yellow-900/50 text-yellow-400"
                }`}
              >
                {tournament.status === "ongoing"
                  ? "En cours"
                  : tournament.status === "completed"
                  ? "Terminé"
                  : "À venir"}
              </span>
              {tournament.prizePool && (
                <span className="text-yellow-500 font-semibold">{tournament.prizePool}</span>
              )}
            </div>
          </div>
          {tournament.status === "upcoming" && (
            <div className="flex gap-3">
              <button
                onClick={handleGenerateBrackets}
                className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
              >
                Générer les brackets
              </button>
            </div>
          )}
        </div>
        {tournament.description && (
          <p className="text-gray-400 mb-6">{tournament.description}</p>
        )}
        <div className="flex gap-6 text-sm text-gray-500">
          <span>Format: {tournament.format === "single_elimination" ? "Élimination directe" : tournament.format}</span>
          <span>Équipes: {tournament.teams?.length || 0}/{tournament.maxTeams}</span>
          {tournament.startDate && (
            <span>Début: {new Date(tournament.startDate).toLocaleDateString("fr-FR")}</span>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Matchs</h2>
          {Object.keys(matchesByRound).length === 0 ? (
            <p className="text-gray-500">
              Aucun match pour le moment. Générez les brackets pour commencer !
            </p>
          ) : (
            Object.entries(matchesByRound).map(([round, matches]: [string, any]) => (
              <div key={round} className="mb-6">
                <h3 className="text-lg font-semibold text-gray-300 mb-3">
                  Round {round}
                </h3>
                <div className="space-y-3">
                  {matches.map((m: any) => (
                    <div
                      key={m.id}
                      className={`bg-gray-900 border rounded-lg p-4 ${
                        m.status === "completed"
                          ? "border-green-800"
                          : "border-gray-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <span
                            className={`font-medium ${
                              m.winnerId === m.team1Id
                                ? "text-green-400"
                                : "text-gray-300"
                            }`}
                          >
                            {m.team1Id
                              ? tournament.teams?.find(
                                  (t: any) => t.teamId === m.team1Id
                                )?.team?.name || "TBD"
                              : "TBD"}
                          </span>
                          <span className="text-gray-600">vs</span>
                          <span
                            className={`font-medium ${
                              m.winnerId === m.team2Id
                                ? "text-green-400"
                                : "text-gray-300"
                            }`}
                          >
                            {m.team2Id
                              ? tournament.teams?.find(
                                  (t: any) => t.teamId === m.team2Id
                                )?.team?.name || "TBD"
                              : "TBD"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {m.status === "completed" && (
                            <span className="text-lg font-bold text-purple-400">
                              {m.score1} - {m.score2}
                            </span>
                          )}
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              m.status === "completed"
                                ? "bg-green-900/50 text-green-400"
                                : m.status === "ongoing"
                                ? "bg-yellow-900/50 text-yellow-400"
                                : "bg-gray-800 text-gray-500"
                            }`}
                          >
                            {m.status === "completed"
                              ? "Terminé"
                              : m.status === "ongoing"
                              ? "En cours"
                              : "Planifié"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">
            Équipes ({tournament.teams?.length || 0})
          </h2>
          <div className="space-y-3">
            {tournament.teams?.map((tt: any) => (
              <Link
                key={tt.id}
                to={`/teams/${tt.teamId}`}
                className="block bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-purple-700 transition"
              >
                <div className="font-medium">{tt.team.name}</div>
                <div className="text-sm text-gray-500">[{tt.team.tag}]</div>
              </Link>
            ))}
          </div>
          {tournament.status === "upcoming" && tournament.teams && (
            <div className="mt-6">
              <Link
                to="/teams"
                className="block text-center bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition"
              >
                Rejoindre avec une équipe
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
