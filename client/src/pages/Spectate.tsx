import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";

export default function Spectate() {
  const { matchId } = useParams();
  const [match, setMatch] = useState<any>(null);
  const [tournament, setTournament] = useState<any>(null);
  const [spectators, setSpectators] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!matchId) return;
    setLoading(true);
    api.matches.listByTournament("").catch(() => []).then(async () => {
      // We need to find which tournament this match belongs to.
      // For now, fetch directly via a known tournament
    });

    // Fetch all tournaments to find the match
    api.tournaments.list().then(async (tournaments) => {
      for (const t of tournaments) {
        const full = await api.tournaments.get(t.id);
        const found = full.matches?.find((m: any) => m.id === matchId);
        if (found) {
          setMatch(found);
          setTournament(full);
          setSpectators(found.spectatorCount || 0);
          break;
        }
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [matchId]);

  useEffect(() => {
    if (!match || match.status !== "ongoing") return;
    intervalRef.current = setInterval(async () => {
      try {
        const tournaments = await api.tournaments.list();
        for (const t of tournaments) {
          const full = await api.tournaments.get(t.id);
          const found = full.matches?.find((m: any) => m.id === matchId);
          if (found) { setMatch(found); break; }
        }
      } catch {}
    }, 10000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [match?.status, matchId]);

  const handleSpectate = async () => {
    if (!matchId) return;
    try {
      const res = await api.tournaments.spectate(matchId);
      setSpectators(res.spectatorCount);
    } catch {}
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Chargement...</div>;
  if (!match || !tournament) return <div className="text-center py-16 text-gray-400">Match non trouvé</div>;

  const team1 = tournament.teams?.find((t: any) => t.teamId === match.team1Id)?.team;
  const team2 = tournament.teams?.find((t: any) => t.teamId === match.team2Id)?.team;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to={`/tournaments/${tournament.id}`} className="text-sm text-gray-500 hover:text-purple-400 transition mb-4 inline-block">
        ← Retour au tournoi
      </Link>

      <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-purple-950/30 border border-gray-800 rounded-2xl overflow-hidden mb-6">
        <div className="relative p-6 sm:p-10 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent pointer-events-none" />

          {match.status === "ongoing" && (
            <div className="inline-flex items-center gap-2 bg-red-900/30 border border-red-700/40 rounded-full px-4 py-1.5 text-xs text-red-400 mb-4">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              EN DIRECT
            </div>
          )}

          <div className="flex items-center justify-center gap-6 sm:gap-12 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-gray-700 flex items-center justify-center mx-auto mb-2">
                <span className="text-xl sm:text-3xl font-bold text-white">{team1?.name?.[0] || "?"}</span>
              </div>
              <div className="text-sm sm:text-lg font-bold text-white">{team1?.name || "TBD"}</div>
            </div>

            <div className="text-center">
              <div className="text-3xl sm:text-5xl font-bold font-mono">
                <span className={match.score1 != null && match.score2 != null ? (match.score1 > match.score2 ? "text-green-400" : "text-gray-400") : "text-gray-600"}>
                  {match.score1 ?? "?"}
                </span>
                <span className="text-gray-600 mx-2 sm:mx-4">:</span>
                <span className={match.score1 != null && match.score2 != null ? (match.score2 > match.score1 ? "text-green-400" : "text-gray-400") : "text-gray-600"}>
                  {match.score2 ?? "?"}
                </span>
              </div>
              <div className="text-[10px] text-gray-600 mt-1">
                Round {match.round} · Match #{match.matchIndex + 1}
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-gray-700 flex items-center justify-center mx-auto mb-2">
                <span className="text-xl sm:text-3xl font-bold text-white">{team2?.name?.[0] || "?"}</span>
              </div>
              <div className="text-sm sm:text-lg font-bold text-white">{team2?.name || "TBD"}</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              <span>{spectators} spectateur{spectators > 1 ? "s" : ""}</span>
            </div>
            <span>·</span>
            <span>{tournament.name}</span>
          </div>

          {match.status === "ongoing" && (
            <button onClick={handleSpectate}
              className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition">
              Rejoindre les spectateurs
            </button>
          )}

          {match.streamUrl && (
            <a href={match.streamUrl} target="_blank" rel="noopener noreferrer"
              className="mt-4 ml-3 px-6 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm transition inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              Regarder le stream
            </a>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Informations du match
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Tournoi</span><span className="text-gray-200 font-medium">{tournament.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Round</span><span className="text-gray-200 font-medium">{match.round}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Statut</span>
              <span className={`${match.status === "ongoing" ? "text-green-400" : match.status === "completed" ? "text-blue-400" : "text-yellow-400"}`}>
                {match.status === "ongoing" ? "En cours" : match.status === "completed" ? "Terminé" : "Programmé"}
              </span>
            </div>
            {match.scheduledAt && <div className="flex justify-between"><span className="text-gray-500">Planifié</span><span className="text-gray-200 font-medium">{new Date(match.scheduledAt).toLocaleString("fr-FR")}</span></div>}
            {match.playedAt && <div className="flex justify-between"><span className="text-gray-500">Joué le</span><span className="text-gray-200 font-medium">{new Date(match.playedAt).toLocaleString("fr-FR")}</span></div>}
            {match.delayed && <div className="flex justify-between"><span className="text-yellow-400">⚠ Retard signalé</span></div>}
          </div>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Équipes
          </h3>
          <div className="space-y-3">
            {[team1, team2].filter(Boolean).map((team: any) => (
              <div key={team.id} className="flex items-center gap-3 bg-gray-950/60 rounded-lg p-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {team.name?.[0] || "?"}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{team.name}</div>
                  <div className="text-[10px] text-gray-500">[{team.tag}]</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
