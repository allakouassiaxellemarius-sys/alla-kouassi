import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import EFootballSection from "../components/EFootballSection";
import TournamentProgress from "../components/TournamentProgress";
import RegistrationWizard from "../components/RegistrationWizard";
import Leaderboard from "../components/Leaderboard";
import GuideSteps from "../components/GuideSteps";
import CountdownTimer from "../components/CountdownTimer";
import WinnerSection from "../components/WinnerSection";
import ScoreReportForm from "../components/ScoreReportForm";
import DisputeForm from "../components/DisputeForm";
import ContactOrganizerButton from "../components/ContactOrganizerButton";
import ReportButton from "../components/ReportButton";
import EditTournamentModal from "../components/EditTournamentModal";
import { playSound } from "../utils/sound";
import StatusBadge from "../components/StatusBadge";

function getStatusLabel(status: string) {
  if (status === "ongoing") return "En cours";
  if (status === "completed") return "Terminé";
  return "Programmé";
}

function exportTournamentCSV(tournament: any, teams: any[], matches: any[]) {
  const csvRows: string[] = [];
  csvRows.push("Équipes inscrites");
  csvRows.push("Nom,Tag,Membres");
  teams.forEach((tt: any) => {
    const members = (tt.team.members || []).map((m: any) => m.user?.username || "").join("; ");
    csvRows.push(`${tt.team.name},[${tt.team.tag}],${members}`);
  });
  csvRows.push("");
  csvRows.push("Matchs");
  csvRows.push("Round,Match,Équipe 1,Score,Équipe 2,Vainqueur");
  matches.forEach((m: any) => {
    const t1 = teams.find((t: any) => t.teamId === m.team1Id)?.team?.name || "TBD";
    const t2 = teams.find((t: any) => t.teamId === m.team2Id)?.team?.name || "TBD";
    const winner = m.winnerId ? teams.find((t: any) => t.teamId === m.winnerId)?.team?.name || "—" : "—";
    csvRows.push(`${m.round},#${m.matchIndex + 1},${t1},${m.score1 ?? "?"}-${m.score2 ?? "?"},${t2},${winner}`);
  });
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${tournament.name.replace(/[^a-zA-Z0-9]/g, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TournamentDetail() {
  const { id } = useParams();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.auth.me().then(setUser).catch(() => {});
    }
    if (id) {
      api.tournaments.get(id).then(setTournament).catch(() => {}).finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (!id || !tournament) return;
    const hasActive = tournament.matches?.some((m: any) => m.status === "ongoing") || tournament.status === "ongoing";
    if (!hasActive) return;
    const interval = setInterval(() => {
      api.tournaments.get(id).then(setTournament).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [id, tournament?.status]);

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
      playSound("matchStart");
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
      throw err;
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

  const userTeamId = user ? userTeamIds[0] || null : null;

  const userNextMatch = (() => {
    if (!userTeamId || matches.length === 0) return null;
    const userMatches = matches.filter((m: any) => m.team1Id === userTeamId || m.team2Id === userTeamId);
    const upcoming = userMatches.filter((m: any) => m.status !== "completed");
    if (upcoming.length > 0) return upcoming.sort((a: any, b: any) => a.round - b.round)[0];
    return userMatches.length > 0 ? userMatches[userMatches.length - 1] : null;
  })();

  const userNextOpponent = (() => {
    if (!userNextMatch || !userTeamId) return null;
    const oppId = userNextMatch.team1Id === userTeamId ? userNextMatch.team2Id : userNextMatch.team1Id;
    if (!oppId) return null;
    const tt = teams.find((t: any) => t.teamId === oppId);
    return tt?.team || null;
  })();

  const efootballStats = (() => {
    const completed = matches.filter((m: any) => m.status === "completed");
    const totalGoals = completed.reduce((s: number, m: any) => s + (m.score1 || 0) + (m.score2 || 0), 0);
    const decided = completed.filter((m: any) => m.winnerId);
    return {
      totalMatches: completed.length,
      totalGoals,
      avgGoals: completed.length > 0 ? (totalGoals / completed.length).toFixed(1) : "0",
      decidedMatches: decided.length,
      winRate: completed.length > 0 ? (decided.length / completed.length) * 100 : 0,
    };
  })();

  const isOrganizer = user && tournament.organizers?.some((o: any) => o.user?.id === user.id);

  const refreshTournament = () => {
    if (id) api.tournaments.get(id).then(setTournament).catch(() => {});
  };

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

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold">{tournament.name}</h1>
              {isOrganizer && (
                <span className="text-[10px] bg-purple-900/50 text-purple-400 px-2 py-0.5 rounded-full font-medium border border-purple-700/50" title="Organisateur unique du tournoi">
                  🎯 Organisateur
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <StatusBadge status={tournament.status} />
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
          {isOrganizer && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowEdit(true)}
                className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium px-5 py-3 rounded-xl transition w-full sm:w-auto border border-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Modifier
              </button>
              {tournament.status === "upcoming" && (
                <button onClick={handleGenerateBrackets}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-green-900/40 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                  Générer les brackets
                </button>
              )}
            </div>
          )}
        </div>
        {tournament.description && (
          <p className="text-gray-400 mb-4">{tournament.description}</p>
        )}

        {tournament.status === "upcoming" && tournament.startDate && (
          <CountdownTimer targetDate={tournament.startDate} label="Début du tournoi" />
        )}

        <TournamentProgress tournament={tournament} matches={matches} teams={teams} />
      </div>

      <WinnerSection tournament={tournament} teams={teams} matches={matches} />

      <EFootballSection
        tournament={tournament}
        matches={matches}
        teams={teams}
        stats={efootballStats}
      />

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
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
                    : "L'organisateur doit générer les brackets pour lancer le tournoi."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(matchesByRound).map(([round, roundMatches]: [string, any]) => (
                  <div key={round}>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Round {round}
                      {roundMatches.every((m: any) => m.status === "completed") && (
                        <span className="ml-2 text-[10px] text-green-500">(Terminé)</span>
                      )}
                    </h3>
                    <div className="space-y-2">
                      {roundMatches.map((m: any, idx: number) => {
                        const isUserMatch = user && (
                          (userTeamIds.includes(m.team1Id) || userTeamIds.includes(m.team2Id))
                        );
                        return (
                          <div
                            key={m.id}
                            className={`bg-gray-900 border rounded-lg p-3 sm:p-4 transition ${
                              isUserMatch ? "border-purple-700/50 ring-1 ring-purple-700/20" : ""
                            } ${m.status === "completed" ? "border-green-800" : "border-gray-800"}`}
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
                                        <span className={`font-medium truncate ${m.winnerId === m.team1Id ? "text-green-400" : "text-gray-300"}`}>
                                          {t1?.name || "TBD"}
                                        </span>
                                        <span className="text-gray-600 shrink-0">vs</span>
                                        <span className={`font-medium truncate ${m.winnerId === m.team2Id ? "text-green-400" : "text-gray-300"}`}>
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
                                <div className="flex items-center gap-1.5">
                                  {m.scoreStatus === "pending" && m.status !== "completed" && (
                                    <StatusBadge status="pending" />
                                  )}
                                  {m.delayed && (
                                    <StatusBadge status="delayed" />
                                  )}
                                  <StatusBadge status={m.status} pulse={m.status === "ongoing"} />
                                </div>
                                {isUserMatch && (
                                  <span className="text-[10px] bg-purple-900/50 text-purple-400 px-1.5 py-0.5 rounded-full font-medium">
                                    Mon match
                                  </span>
                                )}
                              </div>
                            </div>
                            <ScoreReportForm
                              match={m}
                              isOrganizer={isOrganizer}
                              userTeamId={user ? userTeamIds[0] || null : null}
                              onScoreSubmitted={refreshTournament}
                            />
                            {m.scoreStatus === "pending" && isOrganizer && (
                              <div className="mt-2 pt-2 border-t border-gray-800">
                                <button
                                  onClick={async () => {
                                    try {
                                      await api.matches.approveScore(m.id);
                                      refreshTournament();
                                    } catch (err: any) {
                                      alert(err.message);
                                    }
                                  }}
                                  className="text-xs px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-lg transition"
                                >
                                  Approuver le score
                                </button>
                              </div>
                            )}
                            {(m.status === "ongoing" || m.status === "scheduled") && isUserMatch && (
                              <div className="mt-2 pt-2 border-t border-gray-800 flex flex-wrap gap-2">
                                <button
                                  onClick={async () => {
                                    if (!confirm("Déclarer forfait ? Vous perdrez ce match.")) return;
                                    try {
                                      await api.matches.forfeit(m.id);
                                      refreshTournament();
                                    } catch (err: any) {
                                      alert(err.message);
                                    }
                                  }}
                                  className="text-xs text-gray-600 hover:text-red-400 transition"
                                >
                                  Déclarer forfait
                                </button>
                                <DisputeForm
                                  matchId={m.id}
                                  tournamentId={tournament.id}
                                  onCreated={refreshTournament}
                                />
                                <ContactOrganizerButton
                                  matchId={m.id}
                                  onSent={refreshTournament}
                                />
                                <ReportButton targetId={m.id} targetType="match" />
                              </div>
                            )}
                            {m.status === "completed" && isUserMatch && (
                              <div className="mt-2 pt-2 border-t border-gray-800 flex flex-wrap gap-2">
                                <DisputeForm
                                  matchId={m.id}
                                  tournamentId={tournament.id}
                                  onCreated={refreshTournament}
                                />
                                <ContactOrganizerButton
                                  matchId={m.id}
                                  onSent={refreshTournament}
                                />
                                <ReportButton targetId={m.id} targetType="match" />
                              </div>
                            )}
                            {(m.status === "ongoing" || m.status === "completed") && (
                              <div className="mt-2 pt-2 border-t border-gray-800 flex flex-wrap gap-2">
                                <Link to={`/spectate/${m.id}`}
                                  className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                  Mode spectateur
                                </Link>
                              </div>
                            )}
                            {isOrganizer && m.status !== "completed" && (
                              <div className="mt-2 pt-2 border-t border-gray-800">
                                <button onClick={async () => {
                                  try {
                                    await api.matches.remindScore(m.id);
                                    alert("Rappel envoyé aux équipes");
                                  } catch (err: any) {
                                    alert(err.message);
                                  }
                                }} className="text-xs text-gray-600 hover:text-yellow-400 transition">
                                  Relancer les équipes
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Leaderboard teams={teams} matches={matches} />

          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Détails du tournoi
              </h3>
              <button onClick={() => exportTournamentCSV(tournament, teams, matches)}
                className="text-[10px] px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 transition flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Export CSV
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div><span className="text-gray-500">Format</span><p className="text-gray-200 font-medium">{tournament.format === "single_elimination" ? "Élimination directe" : tournament.format === "double_elimination" ? "Double élimination" : "Poule"}</p></div>
              <div><span className="text-gray-500">Équipes min</span><p className="text-gray-200 font-medium">{tournament.minTeams}</p></div>
              <div><span className="text-gray-500">Équipes max</span><p className="text-gray-200 font-medium">{tournament.maxTeams}</p></div>
              {tournament.level && tournament.level !== "all" && (
                <div><span className="text-gray-500">Niveau</span><p className="text-purple-400 font-medium capitalize">{tournament.level}</p></div>
              )}
              {tournament.region && (
                <div><span className="text-gray-500">Région</span><p className="text-gray-200 font-medium">{tournament.region}</p></div>
              )}
              {tournament.matchDuration && (
                <div><span className="text-gray-500">Durée</span><p className="text-gray-200 font-medium">{tournament.matchDuration} min</p></div>
              )}
              {tournament.startDate && (
                <div><span className="text-gray-500">Début</span><p className="text-gray-200 font-medium">{new Date(tournament.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p></div>
              )}
              {tournament.endDate && (
                <div><span className="text-gray-500">Fin</span><p className="text-gray-200 font-medium">{new Date(tournament.endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p></div>
              )}
              <div><span className="text-gray-500">Participants</span><p className="text-gray-200 font-medium">{teamsCount} équipe{teamsCount > 1 ? "s" : ""}</p></div>
              <div><span className="text-gray-500">Points</span><p className="text-gray-200 font-medium">V:{tournament.pointsForWin} N:{tournament.pointsForDraw} D:{tournament.pointsForLoss}</p></div>
              {tournament.registrationType && (
                <div><span className="text-gray-500">Inscriptions</span><p className={`font-medium ${tournament.registrationType === "manual" ? "text-yellow-400" : "text-green-400"}`}>{tournament.registrationType === "manual" ? "Manuelle" : "Automatique"}</p></div>
              )}
              {tournament.startDate && tournament.status === "upcoming" && (
                <div><span className="text-gray-500">Inscriptions jusqu'au</span><p className="text-yellow-400 font-medium">{new Date(tournament.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p></div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <RegistrationWizard
            tournament={tournament}
            user={user}
            onRegister={handleRegister}
            onUnregister={handleUnregister}
            userTeamInTournament={userTeamInTournament}
          />

          {userNextMatch && userTeamInTournament && (
            <div className="bg-gradient-to-r from-purple-900/30 to-gray-900 border border-purple-700/30 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Prochain match
              </h3>
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm">{userNextMatch.team1Id === userTeamId ? userTeamInTournament.team?.name : userTeamInTournament.team?.name}</span>
                <span className="text-gray-600 text-xs">vs</span>
                <span className="font-bold text-sm text-purple-400">{userNextOpponent?.name || "En attente"}</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span>Round {userNextMatch.round}</span>
                {userNextMatch.delayed && (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Retardé
                  </span>
                )}
              </div>
              {userNextMatch.status !== "completed" && (
                <button
                  onClick={async () => {
                    const reason = prompt("Raison du retard (optionnel):");
                    try {
                      await api.matches.delay(userNextMatch.id, reason || undefined);
                      refreshTournament();
                    } catch (err: any) {
                      alert(err.message);
                    }
                  }}
                  className="mt-3 text-xs text-gray-600 hover:text-yellow-400 transition flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Signaler un retard
                </button>
              )}
            </div>
          )}

          {user && (
            <GuideSteps
              tournament={tournament}
              user={user}
              userTeamInTournament={userTeamInTournament}
              matches={matches}
            />
          )}

          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Équipes ({teamsCount}/{maxTeams})
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {teams.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucune équipe inscrite pour le moment.</p>
              ) : (
                teams.map((tt: any) => {
                  const isMyTeam = userTeamIds.includes(tt.teamId);
                  return (
                    <div key={tt.id} className={`bg-gray-900 border rounded-lg p-3 transition ${isMyTeam ? "border-purple-700/50 ring-1 ring-purple-700/20" : "border-gray-800"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <Link to={`/teams/${tt.teamId}`} className="font-medium hover:text-purple-400 transition truncate">{tt.team.name}</Link>
                          {isMyTeam && <span className="text-[10px] bg-purple-900/50 text-purple-400 px-1.5 py-0.5 rounded-full font-medium shrink-0">Mon équipe</span>}
                        </div>
                        <span className="text-xs font-mono text-gray-500 shrink-0">[{tt.team.tag}]</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(tt.team.members || []).slice(0, 6).map((m: any) => (
                          <span key={m.id} className={`text-[11px] px-2 py-0.5 rounded-full ${m.role === "captain" ? "bg-yellow-900/30 text-yellow-400 border border-yellow-700/50" : "bg-gray-800 text-gray-400"}`}>
                            <Link to={`/profile/${m.user.id}`} className="hover:text-purple-400 transition">{m.user.username}</Link>
                            {m.role === "captain" ? " (C)" : ""}
                          </span>
                        ))}
                        {tt.team.members?.length > 6 && <span className="text-[11px] text-gray-600 px-1">+{tt.team.members.length - 6}</span>}
                      </div>
                      {tt.seed != null && <div className="text-[10px] text-gray-600 mt-2">Seed #{tt.seed}</div>}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {tournament.registrationType === "manual" && isOrganizer && (
            <div className="bg-yellow-900/10 border border-yellow-800/30 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-yellow-500 rounded-full inline-block" />
                Inscriptions en attente
              </h3>
              {teams.filter((tt: any) => tt.approvalStatus === "pending").length === 0 ? (
                <p className="text-gray-500 text-sm">Aucune inscription en attente.</p>
              ) : (
                <div className="space-y-2">
                  {teams.filter((tt: any) => tt.approvalStatus === "pending").map((tt: any) => (
                    <div key={tt.id} className="flex items-center justify-between bg-gray-950/60 rounded-lg p-3">
                      <div>
                        <div className="text-sm font-medium">{tt.team.name}</div>
                        <div className="text-[10px] text-gray-500">[{tt.team.tag}]</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={async () => {
                          try { await api.tournaments.approveTeam(tournament.id, tt.teamId); refreshTournament(); }
                          catch (err: any) { alert(err.message); }
                        }} className="text-xs px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-lg transition">Approuver</button>
                        <button onClick={async () => {
                          try { await api.tournaments.rejectTeam(tournament.id, tt.teamId); refreshTournament(); }
                          catch (err: any) { alert(err.message); }
                        }} className="text-xs px-3 py-1.5 bg-red-900/50 hover:bg-red-800 text-red-400 rounded-lg transition">Refuser</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tournament.rules && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-purple-500 rounded-full inline-block" />
                Règles du tournoi
              </h3>
              <p className="text-gray-400 text-sm whitespace-pre-line">{tournament.rules}</p>
            </div>
          )}
        </div>
      </div>
      {showEdit && (
        <EditTournamentModal
          tournament={tournament}
          onClose={() => setShowEdit(false)}
          onSaved={(updated: any) => {
            setTournament({ ...tournament, ...updated });
            setShowEdit(false);
          }}
        />
      )}
    </div>
  );
}
