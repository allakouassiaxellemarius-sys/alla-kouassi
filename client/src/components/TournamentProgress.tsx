import { useMemo } from "react";

export default function TournamentProgress({ tournament, matches, teams }: {
  tournament: any;
  matches: any[];
  teams: any[];
}) {
  const progress = useMemo(() => {
    const completed = matches.filter((m: any) => m.status === "completed");
    const ongoing = matches.filter((m: any) => m.status === "ongoing");
    const scheduled = matches.filter((m: any) => m.status === "scheduled");
    const rounds = [...new Set(matches.map((m: any) => m.round))].sort((a, b) => a - b);
    const currentRound = rounds.find((r) => {
      const rMatches = matches.filter((m: any) => m.round === r);
      return rMatches.some((m: any) => m.status !== "completed");
    }) || rounds.length;
    const totalRounds = rounds.length;
    const roundMatches = matches.filter((m: any) => m.round === currentRound);
    const roundCompleted = roundMatches.filter((m: any) => m.status === "completed").length;
    const roundTotal = roundMatches.length;

    const nextMatch = matches.find((m: any) =>
      m.status === "scheduled" && m.team1Id && m.team2Id
    ) || matches.find((m: any) =>
      m.status === "scheduled" && m.team1Id
    );

    const nextTeams = nextMatch
      ? {
          t1: teams.find((t: any) => t.teamId === nextMatch.team1Id)?.team,
          t2: nextMatch.team2Id
            ? teams.find((t: any) => t.teamId === nextMatch.team2Id)?.team
            : null,
        }
      : null;

    const teamsRemaining = teams.filter((tt: any) => {
      if (completed.length === 0) return true;
      const lost = completed.some(
        (m: any) =>
          m.winnerId && m.winnerId !== tt.teamId &&
          (m.team1Id === tt.teamId || m.team2Id === tt.teamId)
      );
      const won = completed.some((m: any) => m.winnerId === tt.teamId);
      return !lost || won;
    }).length;

    return {
      completed,
      ongoing,
      scheduled,
      rounds,
      currentRound,
      totalRounds,
      roundCompleted,
      roundTotal,
      nextMatch,
      nextTeams,
      teamsRemaining,
      totalSteps: 4,
    };
  }, [matches, teams]);

  const steps = [
    { num: 1, label: "Inscription", done: teams.length >= 2 },
    { num: 2, label: "Brackets", done: matches.length > 0 },
    { num: 3, label: "Matchs en cours", done: progress.completed.length > 0 },
    { num: 4, label: "Finale", done: tournament.status === "completed" },
  ];

  const currentStep = steps.findLastIndex((s) => s.done) + 1;

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <span className="w-1 h-4 bg-purple-500 rounded-full inline-block" />
          Progression du tournoi
        </h3>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          tournament.status === "completed"
            ? "bg-green-900/50 text-green-400"
            : tournament.status === "ongoing"
            ? "bg-yellow-900/50 text-yellow-400"
            : "bg-blue-900/50 text-blue-400"
        }`}>
          {tournament.status === "completed" ? "Terminé" : tournament.status === "ongoing" ? "En cours" : "À venir"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-1.5 ${s.done ? "text-green-400" : i === currentStep ? "text-purple-400" : "text-gray-600"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                s.done
                  ? "bg-green-900/40 border-green-700"
                  : i === currentStep
                  ? "bg-purple-900/40 border-purple-700 animate-pulse"
                  : "bg-gray-800 border-gray-700"
              }`}>
                {s.done ? "✓" : s.num}
              </div>
              <span className="text-xs hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`h-px flex-1 ${s.done ? "bg-green-700/50" : "bg-gray-800"}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-400">{teams.length}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Équipes</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-blue-400">{progress.teamsRemaining}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">En lice</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-purple-400">{progress.completed.length}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Matchs faits</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-yellow-400">{progress.currentRound}/{progress.totalRounds || "?"}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Round</div>
        </div>
      </div>

      {progress.totalRounds > 0 && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Round {progress.currentRound}</span>
            <span>{progress.roundCompleted}/{progress.roundTotal}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-500 h-2 rounded-full transition-all"
              style={{ width: `${progress.roundTotal > 0 ? (progress.roundCompleted / progress.roundTotal) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {progress.totalRounds > 0 && (
        <div className="space-y-1">
          {progress.rounds.map((r) => {
            const rMatches = matches.filter((m: any) => m.round === r);
            const done = rMatches.filter((m: any) => m.status === "completed").length;
            const pct = rMatches.length > 0 ? Math.round((done / rMatches.length) * 100) : 0;
            return (
              <div key={r} className="flex items-center gap-2 text-xs">
                <span className={`w-14 shrink-0 font-medium ${r === progress.currentRound ? "text-purple-400" : "text-gray-600"}`}>
                  Round {r}
                </span>
                <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      pct === 100 ? "bg-green-600" : r === progress.currentRound ? "bg-purple-600" : "bg-gray-700"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 text-right text-gray-500">{done}/{rMatches.length}</span>
              </div>
            );
          })}
        </div>
      )}

      {progress.nextMatch && progress.nextTeams && (
        <div className="bg-gradient-to-r from-purple-900/30 to-gray-800 border border-purple-800/40 rounded-lg p-4">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Prochain match</div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-200 truncate">
              {progress.nextTeams.t1?.name || "TBD"}
            </span>
            <span className="text-xs text-gray-500 mx-3">vs</span>
            <span className="text-sm font-bold text-gray-200 truncate">
              {progress.nextTeams.t2?.name || "À déterminer"}
            </span>
          </div>
          {progress.nextMatch.scheduledAt && (
            <div className="text-[10px] text-gray-500 mt-2">
              {new Date(progress.nextMatch.scheduledAt).toLocaleString("fr-FR")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
