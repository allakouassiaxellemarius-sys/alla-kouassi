import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";

function SvgIcon({ d, className = "w-5 h-5" }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}

function getStatusColor(status: string) {
  if (status === "ongoing") return "bg-green-900/50 text-green-400 border-green-700";
  if (status === "completed") return "bg-blue-900/50 text-blue-400 border-blue-700";
  return "bg-yellow-900/50 text-yellow-400 border-yellow-700";
}

function getStatusLabel(status: string) {
  if (status === "ongoing") return "En cours";
  if (status === "completed") return "Terminé";
  return "À venir";
}

function getMatchIndicator(winnerId: string | null, teamId: string | null) {
  if (!teamId) return { text: "TBD", class: "text-gray-600" };
  if (winnerId && winnerId === teamId) return { text: "Vainqueur", class: "text-green-400 font-bold" };
  return { text: "", class: "" };
}

export default function TournamentDetail() {
  const { id } = useParams();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.auth.me().then(setUser).catch(() => {});
    }
    if (id) {
      api.tournaments.get(id).then(setTournament).catch(() => {}).finally(() => setLoading(false));
    }
  }, [id]);

  const showMsg = (type: "success" | "error", text: string) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 3000);
  };

  const handleGenerateBrackets = async () => {
    if (!confirm("Générer les brackets ? Cela effacera les matchs existants.")) return;
    try {
      const res = await api.tournaments.generateBrackets(tournament.id);
      const updated = await api.tournaments.get(tournament.id);
      setTournament(updated);
      showMsg("success", `${res.matches} matchs générés !`);
    } catch (err: any) {
      showMsg("error", err.message);
    }
  };

  const handleRegister = async (teamId: string) => {
    try {
      await api.tournaments.register(tournament.id, teamId);
      const updated = await api.tournaments.get(tournament.id);
      setTournament(updated);
      showMsg("success", "Inscription réussie !");
    } catch (err: any) {
      showMsg("error", err.message);
    }
  };

  const handleJoinClick = async () => {
    if (!user) return;
    try {
      const u = await api.users.get(user.id);
      setUserTeams(u.teams || []);
      setShowJoinModal(true);
    } catch {
      showMsg("error", "Impossible de charger vos équipes");
    }
  };

  const handleUnregister = async (teamId: string) => {
    if (!confirm("Quitter ce tournoi ?")) return;
    try {
      await api.tournaments.unregister(tournament.id, teamId);
      const updated = await api.tournaments.get(tournament.id);
      setTournament(updated);
      showMsg("success", "Désinscription réussie");
    } catch (err: any) {
      showMsg("error", err.message);
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Chargement...</div>;
  if (!tournament) return <div className="text-center py-16 text-gray-400">Tournoi non trouvé</div>;

  const teams = tournament.teams || [];
  const matches = tournament.matches || [];
  const teamsCount = teams.length;
  const maxTeams = tournament.maxTeams;
  const remaining = maxTeams - teamsCount;
  const progress = maxTeams > 0 ? Math.round((teamsCount / maxTeams) * 100) : 0;

  const matchesByRound = matches.reduce((acc: any, m: any) => {
    if (!acc[m.round]) acc[m.round] = [];
    acc[m.round].push(m);
    return acc;
  }, {} as any);
  const roundCount = Object.keys(matchesByRound).length;

  const userTeamIds = user
    ? teams.filter((tt: any) =>
        tt.team?.members?.some((m: any) => m.user?.id === user.id)
      ).map((tt: any) => tt.teamId)
    : [];

  const userTeamInTournament = user
    ? teams.find((tt: any) =>
        tt.team?.members?.some((m: any) => m.user?.id === user.id)
      )
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      {actionMsg && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${
            actionMsg.type === "success" ? "bg-green-700" : "bg-red-700"
          }`}
        >
          {actionMsg.text}
        </div>
      )}

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">{tournament.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(tournament.status)}`}>
                {getStatusLabel(tournament.status)}
              </span>
              {tournament.game && (
                <span className="flex items-center gap-1 text-gray-300 bg-gray-800 px-3 py-1 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {tournament.game}
                </span>
              )}
              <span className="flex items-center gap-1 text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                {tournament.format === "single_elimination" ? "Élimination directe" : tournament.format}
              </span>
              {tournament.prizePool && (
                <span className="flex items-center gap-1 text-yellow-400 bg-yellow-900/30 border border-yellow-700/50 px-3 py-1 rounded-full font-semibold">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" /></svg>
                  {tournament.prizePool}
                </span>
              )}
              {tournament.startDate && (
                <span className="flex items-center gap-1 text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {new Date(tournament.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
          {tournament.status === "upcoming" && (
            <button
              onClick={handleGenerateBrackets}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-green-900/40 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              Générer les brackets
            </button>
          )}
        </div>
        {tournament.description && (
          <p className="text-gray-400 mb-4">{tournament.description}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{teamsCount}</div>
            <div className="text-xs text-gray-500 mt-1">Inscrites</div>
          </div>
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">{remaining}</div>
            <div className="text-xs text-gray-500 mt-1">Places restantes</div>
          </div>
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{matches.length}</div>
            <div className="text-xs text-gray-500 mt-1">Matchs</div>
          </div>
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{roundCount}</div>
            <div className="text-xs text-gray-500 mt-1">Rounds</div>
          </div>
        </div>

        <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
          <div
            className="bg-gradient-to-r from-purple-600 to-pink-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {tournament.rules && (
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
              Règles du tournoi
            </h3>
            <p className="text-gray-400 text-sm whitespace-pre-line">{tournament.rules}</p>
          </div>
        )}

        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
            Détails du tournoi
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Format</span>
              <p className="text-gray-200 font-medium">
                {tournament.format === "single_elimination"
                  ? "Élimination directe"
                  : tournament.format}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Équipes min</span>
              <p className="text-gray-200 font-medium">{tournament.minTeams}</p>
            </div>
            <div>
              <span className="text-gray-500">Équipes max</span>
              <p className="text-gray-200 font-medium">{tournament.maxTeams}</p>
            </div>
            {tournament.startDate && (
              <div>
                <span className="text-gray-500">Début</span>
                <p className="text-gray-200 font-medium">
                  {new Date(tournament.startDate).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
            {tournament.endDate && (
              <div>
                <span className="text-gray-500">Fin</span>
                <p className="text-gray-200 font-medium">
                  {new Date(tournament.endDate).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
            <div>
              <span className="text-gray-500">Participants</span>
              <p className="text-gray-200 font-medium">
                {teamsCount} équipe{teamsCount > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            Matchs
          </h2>
          {roundCount === 0 ? (
            <div className="bg-gray-900/60 border border-dashed border-gray-700 rounded-xl p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              <p className="text-gray-400 font-medium mb-2">Aucun match pour le moment</p>
              <p className="text-gray-600 text-sm mb-6">
                {teamsCount < 2
                  ? "Ajoutez au moins 2 équipes, puis générez les brackets."
                  : "Cliquez sur « Générer les brackets » pour créer les matchs du tournoi."}
              </p>
              {tournament.status === "upcoming" && teamsCount >= 2 && (
                <button
                  onClick={handleGenerateBrackets}
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  Générer les brackets
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(matchesByRound).map(([round, roundMatches]: [string, any]) => (
                <div key={round}>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Round {round}
                  </h3>
                  <div className="space-y-2">
                    {roundMatches.map((m: any, idx: number) => (
                      <div
                        key={m.id}
                        className={`bg-gray-900 border rounded-lg p-3 sm:p-4 transition ${
                          m.status === "completed" ? "border-green-800" : "border-gray-800"
                        } ${m.winnerId ? "ring-1 ring-green-700/30" : ""}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                            <span className="text-xs text-gray-600 w-6 text-right shrink-0">#{idx + 1}</span>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {(() => {
                                const t1 = m.team1Id ? teams.find((t: any) => t.teamId === m.team1Id)?.team : null;
                                const t2 = m.team2Id ? teams.find((t: any) => t.teamId === m.team2Id)?.team : null;
                                return (
                                  <>
                                    <span
                                      className={`font-medium truncate ${
                                        m.winnerId === m.team1Id
                                          ? "text-green-400"
                                          : "text-gray-300"
                                      }`}
                                    >
                                      {t1?.name || "TBD"}
                                    </span>
                                    <span className="text-gray-600 shrink-0">vs</span>
                                    <span
                                      className={`font-medium truncate ${
                                        m.winnerId === m.team2Id
                                          ? "text-green-400"
                                          : "text-gray-300"
                                      }`}
                                    >
                                      {t2?.name || "TBD"}
                                    </span>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 sm:ml-4">
                            {m.status === "completed" && m.score1 != null && m.score2 != null && (
                              <span className="text-lg font-bold text-purple-400 tabular-nums">
                                {m.score1} – {m.score2}
                              </span>
                            )}
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                m.status === "completed"
                                  ? "bg-green-900/50 text-green-400"
                                  : m.status === "ongoing"
                                  ? "bg-yellow-900/50 text-yellow-400"
                                  : "bg-gray-800 text-gray-500"
                              }`}
                            >
                              {m.status === "completed" ? "Terminé" : m.status === "ongoing" ? "En cours" : "Planifié"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Équipes ({teamsCount}/{maxTeams})
          </h2>
          <div className="space-y-3">
            {teams.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucune équipe inscrite pour le moment.</p>
            ) : (
              teams.map((tt: any) => {
                const isMyTeam = userTeamIds.includes(tt.teamId);
                return (
                  <div
                    key={tt.id}
                    className={`bg-gray-900 border rounded-lg p-3 transition ${
                      isMyTeam ? "border-purple-700/50 ring-1 ring-purple-700/20" : "border-gray-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Link
                        to={`/teams/${tt.teamId}`}
                        className="font-medium hover:text-purple-400 transition truncate"
                      >
                        {tt.team.name}
                      </Link>
                      <div className="flex items-center gap-1 shrink-0">
                        {isMyTeam && (
                          <span className="text-[10px] bg-purple-900/50 text-purple-400 px-1.5 py-0.5 rounded-full font-medium">
                            Mon équipe
                          </span>
                        )}
                        <span className="text-xs font-mono text-gray-500">[{tt.team.tag}]</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(tt.team.members || []).slice(0, 6).map((m: any) => (
                        <span
                          key={m.id}
                          className={`text-[11px] px-2 py-0.5 rounded-full ${
                            m.role === "captain"
                              ? "bg-yellow-900/30 text-yellow-400 border border-yellow-700/50"
                              : "bg-gray-800 text-gray-400"
                          }`}
                        >
                          {m.user.username}
                          {m.role === "captain" ? " (C)" : ""}
                        </span>
                      ))}
                      {tt.team.members?.length > 6 && (
                        <span className="text-[11px] text-gray-600 px-1">
                          +{tt.team.members.length - 6}
                        </span>
                      )}
                    </div>
                    {tt.seed != null && (
                      <div className="text-[10px] text-gray-600 mt-2">
                        Seed #{tt.seed}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 space-y-3">
            {user && (
              <>
                {userTeamInTournament ? (
                  <div className="space-y-2">
                    <Link
                      to={`/teams/${userTeamInTournament.teamId}`}
                      className="block text-center bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium px-4 py-2.5 rounded-lg transition"
                    >
                      Voir mon équipe
                    </Link>
                    {tournament.status === "upcoming" && (
                      <button
                        onClick={() => handleUnregister(userTeamInTournament.teamId)}
                        className="block w-full text-center bg-red-900/30 hover:bg-red-900/50 text-red-400 font-medium px-4 py-2.5 rounded-lg transition border border-red-800/50"
                      >
                        Quitter le tournoi
                      </button>
                    )}
                  </div>
                ) : tournament.status === "upcoming" && teamsCount < maxTeams ? (
                  <button
                    onClick={handleJoinClick}
                    className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2.5 rounded-lg transition"
                  >
                    Rejoindre avec une équipe
                  </button>
                ) : null}
              </>
            )}
          </div>

          {roundCount > 0 && (
            <div className="mt-6 bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                Aperçu des brackets
              </h3>
              <div className="space-y-1">
                {Object.entries(matchesByRound).map(([round, roundMatches]: [string, any]) => (
                  <div key={round} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600 w-16 shrink-0 text-xs">Round {round}</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                      <div
                        className="bg-purple-600 h-1.5 rounded-full"
                        style={{
                          width: `${
                            roundMatches.length > 0
                              ? Math.round(
                                  (roundMatches.filter((m: any) => m.status === "completed").length /
                                    roundMatches.length) *
                                    100
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-gray-500 text-xs w-16 text-right">
                      {roundMatches.filter((m: any) => m.status === "completed").length}/{roundMatches.length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowJoinModal(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Choisissez une équipe</h3>
            {userTeams.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400 mb-4">Vous n'avez pas encore d'équipe</p>
                <Link
                  to="/teams/create"
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
                  onClick={() => setShowJoinModal(false)}
                >
                  Créer une équipe
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {userTeams.map((ut: any) => {
                  const alreadyIn = teams.some((tt: any) => tt.teamId === ut.team.id);
                  return (
                    <button
                      key={ut.id}
                      disabled={alreadyIn}
                      onClick={() => { handleRegister(ut.team.id); setShowJoinModal(false); }}
                      className={`w-full text-left flex items-center justify-between p-3 rounded-lg border transition ${
                        alreadyIn
                          ? "bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed"
                          : "bg-gray-800/50 border-gray-800 hover:border-purple-700 cursor-pointer"
                      }`}
                    >
                      <div>
                        <div className="font-medium">{ut.team.name}</div>
                        <div className="text-xs text-gray-500">[{ut.team.tag}]</div>
                      </div>
                      {alreadyIn ? (
                        <span className="text-xs text-gray-500">Déjà inscrite</span>
                      ) : (
                        <span className="text-xs text-purple-400">Sélectionner</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            <button
              onClick={() => setShowJoinModal(false)}
              className="mt-4 w-full text-center text-gray-500 hover:text-gray-300 py-2 transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
