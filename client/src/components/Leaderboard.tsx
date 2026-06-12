export default function Leaderboard({ teams, matches }: { teams: any[]; matches: any[] }) {
  if (teams.length === 0) return null;

  const ranked = teams
    .map((tt: any) => {
      const teamMatches = matches.filter(
        (m: any) => m.team1Id === tt.teamId || m.team2Id === tt.teamId
      );
      const completed = teamMatches.filter((m: any) => m.status === "completed");
      const wins = teamMatches.filter((m: any) => m.winnerId === tt.teamId).length;
      const losses = completed.length - wins;
      const goalsFor = teamMatches.reduce((sum: number, m: any) => {
        if (m.team1Id === tt.teamId && m.score1 != null) return sum + m.score1;
        if (m.team2Id === tt.teamId && m.score2 != null) return sum + m.score2;
        return sum;
      }, 0);
      const goalsAgainst = teamMatches.reduce((sum: number, m: any) => {
        if (m.team1Id === tt.teamId && m.score2 != null) return sum + m.score2;
        if (m.team2Id === tt.teamId && m.score1 != null) return sum + m.score1;
        return sum;
      }, 0);
      return {
        id: tt.teamId,
        name: tt.team.name,
        tag: tt.team.tag,
        wins,
        losses,
        goalsFor,
        goalsAgainst,
        gd: goalsFor - goalsAgainst,
        played: completed.length,
        winRate: completed.length > 0 ? Math.round((wins / completed.length) * 100) : 0,
      };
    })
    .sort((a, b) => b.wins - a.wins || b.gd - a.gd || b.goalsFor - a.goalsFor);

  const maxRank = ranked.length;

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-5 pb-0">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <span className="w-1 h-4 bg-yellow-500 rounded-full inline-block" />
          Classement
        </h3>
      </div>
      <div className="p-3">
        {ranked.map((team, idx) => (
          <div
            key={team.id}
            className={`flex items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
              idx === 0 && team.played > 0
                ? "bg-yellow-900/20 border border-yellow-800/30 mb-1"
                : "hover:bg-gray-800/50"
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              idx === 0 && team.played > 0
                ? "bg-yellow-900/40 text-yellow-400"
                : idx === 1 && team.played > 0
                ? "bg-gray-700 text-gray-300"
                : idx === 2 && team.played > 0
                ? "bg-amber-900/40 text-amber-400"
                : "bg-gray-800 text-gray-600"
            }`}>
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate flex items-center gap-1.5">
                {team.name}
                {idx === 0 && team.played > 0 && (
                  <svg className="w-3.5 h-3.5 text-yellow-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
              </div>
              <div className="text-[10px] text-gray-600">[{team.tag}]</div>
            </div>
            {team.played > 0 ? (
              <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
                <span className="text-gray-400 w-8 text-right tabular-nums">{team.wins}V</span>
                <span className="text-gray-600 w-6 text-right tabular-nums">{team.losses}D</span>
                <span className="text-blue-400 tabular-nums w-12 text-right">{team.goalsFor}:{team.goalsAgainst}</span>
                <span className={`tabular-nums w-8 text-right font-medium ${
                  team.winRate >= 70 ? "text-green-400" : team.winRate >= 40 ? "text-yellow-400" : "text-gray-500"
                }`}>
                  {team.winRate}%
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-600">—</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
