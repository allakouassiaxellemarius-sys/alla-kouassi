import { useEffect } from "react";
import { Link } from "react-router-dom";
import { playSound } from "../utils/sound";

export default function WinnerSection({ tournament, teams, matches }: {
  tournament: any;
  teams: any[];
  matches: any[];
}) {
  useEffect(() => {
    if (tournament.status === "completed") {
      playSound("victory");
    }
  }, [tournament.status]);

  if (tournament.status !== "completed") return null;

  const lastRound = Math.max(...matches.map((m: any) => m.round), 0);
  const finalMatches = matches.filter((m: any) => m.round === lastRound);
  const finalMatch = finalMatches.find((m: any) => m.winnerId);
  if (!finalMatch) return null;

  const winnerTeam = teams.find((tt: any) => tt.teamId === finalMatch.winnerId)?.team;
  const loserTeam = teams.find((tt: any) =>
    [finalMatch.team1Id, finalMatch.team2Id].includes(tt.teamId) && tt.teamId !== finalMatch.winnerId
  )?.team;

  if (!winnerTeam) return null;

  const winnerMatches = matches.filter(
    (m: any) => m.team1Id === finalMatch.winnerId || m.team2Id === finalMatch.winnerId
  );
  const winnerWins = winnerMatches.filter((m: any) => m.winnerId === finalMatch.winnerId).length;
  const winnerGoals = winnerMatches.reduce((sum, m) => {
    if (m.team1Id === finalMatch.winnerId && m.score1 != null) return sum + m.score1;
    if (m.team2Id === finalMatch.winnerId && m.score2 != null) return sum + m.score2;
    return sum;
  }, 0);
  const winnerAgainst = winnerMatches.reduce((sum, m) => {
    if (m.team1Id === finalMatch.winnerId && m.score2 != null) return sum + m.score2;
    if (m.team2Id === finalMatch.winnerId && m.score1 != null) return sum + m.score1;
    return sum;
  }, 0);

  return (
    <div className="bg-gradient-to-br from-yellow-900/30 via-yellow-800/10 to-gray-900 border border-yellow-700/40 rounded-2xl p-6 sm:p-8 mb-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(234,179,8,0.08)_0%,_transparent_60%)] pointer-events-none" />

      <div className="text-center relative">
        <div className="text-4xl mb-2">🏆</div>
        <div className="text-[10px] text-yellow-500 uppercase tracking-widest font-semibold mb-2">Tournoi terminé</div>
        <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-4">{winnerTeam.name}</h2>

        {finalMatch.score1 != null && finalMatch.score2 != null && (
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-lg font-bold text-gray-300">{loserTeam?.name || "Adversaire"}</span>
            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg px-6 py-2">
              <span className="text-2xl font-bold text-white tabular-nums">
                {finalMatch.score1} – {finalMatch.score2}
              </span>
            </div>
            <span className="text-lg font-bold text-yellow-400">{winnerTeam.name}</span>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-4 text-sm mt-4">
          <div className="bg-white/5 rounded-lg px-4 py-2">
            <div className="text-xs text-gray-500">Parcours</div>
            <div className="font-medium text-gray-200">{winnerWins} victoires · {winnerGoals}:{winnerAgainst} goal-diff</div>
          </div>
          {tournament.prizePool && (
            <div className="bg-yellow-900/20 rounded-lg px-4 py-2 border border-yellow-800/30">
              <div className="text-xs text-yellow-600">Prize</div>
              <div className="font-bold text-yellow-400">{tournament.prizePool}</div>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to={`/teams/${winnerTeam.id}`}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
          >
            Voir l'équipe gagnante
          </Link>
        </div>
      </div>
    </div>
  );
}
