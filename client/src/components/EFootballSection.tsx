import { useState } from "react";

function LaunchButton() {
  const handleLaunch = () => {
    try {
      window.open("efootball://", "_blank");
    } catch {
      window.open("https://store.steampowered.com/app/1665460/eFootball/", "_blank");
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleLaunch}
        className="flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-900/40"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Lancer eFootball
      </button>
      <a
        href="https://store.steampowered.com/app/1665460/eFootball/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl transition-all border border-white/10"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        Voir sur Steam
      </a>
    </div>
  );
}

const gameModes = [
  { id: "1v1", label: "1v1", desc: "Face à face standard" },
  { id: "coop", label: "2v2 Coop", desc: "Deux joueurs par équipe" },
  { id: "ranked", label: "Compétitif", desc: "Avec classement ELO" },
  { id: "dream-team", label: "Dream Team", desc: "Mode Dream Team" },
  { id: "online", label: "Multijoueur", desc: "Match en ligne" },
  { id: "offline", label: "Hors ligne", desc: "En local" },
];

const platforms = [
  { id: "playstation", label: "PlayStation 4/5", icon: "🎮" },
  { id: "xbox", label: "Xbox One/Series S/X", icon: "🎮" },
  { id: "pc", label: "PC (Steam / Windows)", icon: "🖥️" },
  { id: "mobile", label: "Mobile (iOS / Android)", icon: "📱" },
];

const defaultRules = [
  { key: "matchDuration", label: "Durée du match", value: "10 min par mi-temps" },
  { key: "difficulty", label: "Niveau de difficulté", value: "Professionnel ou Légende" },
  { key: "extraTime", label: "Prolongations", value: "Activé (2 × 5 min)" },
  { key: "penalties", label: "Tirs au but", value: "Activé si égalité" },
  { key: "teamSelection", label: "Sélection des équipes", value: "Club uniquement (5★ max)" },
  { key: "condition", label: "Condition physique", value: "Bonne / Normale" },
  { key: "injuries", label: "Blessures", value: "Désactivé" },
  { key: "substitutes", label: "Remplacements", value: "5 remplacements max" },
];

export default function EFootballSection({ tournament, matches, teams, stats }: {
  tournament: any;
  matches: any[];
  teams: any[];
  stats: { totalMatches: number; totalGoals: number; avgGoals: string; decidedMatches: number; winRate: number };
}) {
  const isEFootball = tournament.game?.toLowerCase().includes("efootball") ||
                       tournament.game?.toLowerCase() === "pes";

  const [copied, setCopied] = useState(false);

  if (!isEFootball) return null;

  const completedMatches = matches.filter((m: any) => m.status === "completed" && m.score1 != null);

  return (
    <div className="space-y-6 mb-8">
      <div className="bg-gradient-to-br from-[#1a1a2e] via-[#e60000]/10 to-[#1a1a2e] border border-red-900/40 rounded-2xl p-6 sm:p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 opacity-5 pointer-events-none">
          <svg viewBox="0 0 200 200" fill="white">
            <circle cx="100" cy="100" r="80" />
            <circle cx="100" cy="100" r="55" fill="none" stroke="white" strokeWidth="3" />
            <path d="M60 80 L100 45 L140 80" fill="none" stroke="white" strokeWidth="4" />
            <path d="M60 120 L100 155 L140 120" fill="none" stroke="white" strokeWidth="4" />
          </svg>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5 border border-white/10">
            <div className="text-2xl">⚽</div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">eFootball</div>
              <div className="text-[10px] text-red-400 font-semibold uppercase tracking-widest">Tournoi Officiel</div>
            </div>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map((s) => (
              <div key={s} className="w-2 h-2 rounded-full bg-red-600 animate-pulse" style={{ animationDelay: `${s * 0.3}s` }} />
            ))}
          </div>
        </div>

        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-red-600 rounded-full inline-block" />
          Modes de jeu
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
          {gameModes.map((mode) => (
            <div key={mode.id} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 hover:bg-white/10 transition cursor-default">
              <div className="text-sm font-semibold text-white">{mode.label}</div>
              <div className="text-[10px] text-gray-500">{mode.desc}</div>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-red-600 rounded-full inline-block" />
          Plateformes autorisées
        </h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {platforms.map((p) => (
            <div key={p.id} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-sm">
              <span>{p.icon}</span>
              <span className="text-gray-300">{p.label}</span>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-red-600 rounded-full inline-block" />
          Règles du match
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
          {defaultRules.map((r) => (
            <div key={r.key} className="bg-white/5 border border-white/[0.07] rounded-lg px-4 py-2.5 flex items-center justify-between gap-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">{r.label}</span>
              <span className="text-xs text-gray-200 font-medium text-right shrink-0">{r.value}</span>
            </div>
          ))}
        </div>

        {tournament.rules && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
            <h4 className="text-sm font-semibold text-white mb-2">Règles personnalisées du tournoi</h4>
            <p className="text-gray-400 text-sm whitespace-pre-line">{tournament.rules}</p>
          </div>
        )}
      </div>

      {completedMatches.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-red-600 rounded-full inline-block" />
            Résultats des matchs
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {completedMatches.map((m: any) => {
              const t1 = teams.find((t: any) => t.teamId === m.team1Id)?.team;
              const t2 = teams.find((t: any) => t.teamId === m.team2Id)?.team;
              return (
                <div key={m.id} className="bg-gradient-to-r from-gray-800 to-gray-900 border border-green-800/60 rounded-xl p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold truncate ${m.winnerId === m.team1Id ? "text-green-400" : "text-gray-400"}`}>
                      {t1?.name || "TBD"}
                    </div>
                    <div className={`text-sm font-bold truncate ${m.winnerId === m.team2Id ? "text-green-400" : "text-gray-400"}`}>
                      {t2?.name || "TBD"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-red-900/30 rounded-lg px-4 py-1.5 border border-red-800/50">
                      <span className="text-xl font-bold text-white tabular-nums">
                        {m.score1} – {m.score2}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">Final</div>
                  </div>
                  <div className="text-right text-xs text-gray-600">
                    Round {m.round}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-red-600 rounded-full inline-block" />
            Statistiques du tournoi
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center bg-gray-800/50 rounded-xl p-3">
              <div className="text-2xl font-bold text-green-400">{stats.totalMatches}</div>
              <div className="text-xs text-gray-500">Matchs joués</div>
            </div>
            <div className="text-center bg-gray-800/50 rounded-xl p-3">
              <div className="text-2xl font-bold text-blue-400">{stats.totalGoals}</div>
              <div className="text-xs text-gray-500">Buts total</div>
            </div>
            <div className="text-center bg-gray-800/50 rounded-xl p-3">
              <div className="text-2xl font-bold text-yellow-400">{stats.avgGoals}</div>
              <div className="text-xs text-gray-500">Moy. buts/match</div>
            </div>
            <div className="text-center bg-gray-800/50 rounded-xl p-3">
              <div className="text-2xl font-bold text-purple-400">{stats.decidedMatches}</div>
              <div className="text-xs text-gray-500">Matchs décidés</div>
            </div>
          </div>
          {stats.totalMatches > 0 && (
            <div className="mt-4 flex items-center gap-4 justify-center">
              <div className="w-full max-w-xs bg-gray-800 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-green-600 to-emerald-400 h-2.5 rounded-full transition-all"
                  style={{ width: `${Math.round(stats.winRate)}%` }}
                />
              </div>
              <span className="text-sm text-gray-400 font-medium">{Math.round(stats.winRate)}%</span>
            </div>
          )}
          <div className="mt-4 space-y-2">
            {teams.slice(0, 8).map((tt: any) => {
              const teamMatches = matches.filter(
                (m: any) => m.team1Id === tt.teamId || m.team2Id === tt.teamId
              );
              const teamWins = teamMatches.filter((m: any) => m.winnerId === tt.teamId).length;
              const teamGoals = teamMatches.reduce((sum: number, m: any) => {
                if (m.team1Id === tt.teamId && m.score1 != null) return sum + m.score1;
                if (m.team2Id === tt.teamId && m.score2 != null) return sum + m.score2;
                return sum;
              }, 0);
              const teamAgainst = teamMatches.reduce((sum: number, m: any) => {
                if (m.team1Id === tt.teamId && m.score2 != null) return sum + m.score2;
                if (m.team2Id === tt.teamId && m.score1 != null) return sum + m.score1;
                return sum;
              }, 0);
              return (
                <div key={tt.id} className="flex items-center gap-3 text-sm bg-gray-800/50 rounded-lg px-3 py-2">
                  <span className="font-medium text-gray-200 flex-1 truncate">{tt.team.name}</span>
                  <span className="text-green-400 tabular-nums w-8 text-right font-medium">{teamWins}V</span>
                  <span className="text-gray-500 tabular-nums w-8 text-right">{teamMatches.length - teamWins}D</span>
                  <span className="text-blue-400 tabular-nums w-12 text-right">{teamGoals}:{teamAgainst}</span>
                  <span className="text-gray-600 tabular-nums text-xs">{teamMatches.length} matchs</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-red-600 rounded-full inline-block" />
          Comment participer sur eFootball ?
        </h3>
        <ol className="space-y-4">
          {[
            {
              step: 1, title: "Installer eFootball",
              desc: "Téléchargez eFootball gratuitement sur PlayStation Store, Microsoft Store, Steam ou App Store / Google Play.",
              action: { label: "Télécharger sur Steam", href: "https://store.steampowered.com/app/1665460/eFootball/" },
            },
            {
              step: 2, title: "Créer votre équipe",
              desc: "Lancez le jeu et créez votre Dream Team ou sélectionnez un club. Personnalisez votre maillot et votre palmarès.",
              action: null,
            },
            {
              step: 3, title: "Rejoindre le tournoi",
              desc: "Inscrivez votre équipe sur cette page. Suivez le bracket et vos matchs en direct.",
              action: null,
            },
            {
              step: 4, title: "Jouer vos matchs",
              desc: "Lancez eFootball au moment de votre match. Configurez les paramètres selon les règles du tournoi. Rapportez votre score.",
              action: null,
            },
            {
              step: 5, title: "Suivre le classement",
              desc: "Consultez les résultats, les statistiques et votre prochain adversaire sur cette page.",
              action: null,
            },
          ].map((item) => (
            <li key={item.step} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600/20 border border-red-700/40 flex items-center justify-center text-sm font-bold text-red-400">
                {item.step}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                {item.action && (
                  <a
                    href={item.action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium mt-2 transition"
                  >
                    {item.action.label}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-4">
            Après avoir lancé eFootball, créez ou rejoignez une salle en ligne.
            Copiez le nom de la salle ci-dessous pour inviter votre adversaire.
          </p>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <input
              readOnly
              value={`EFC-TOURNOI-${tournament.id?.slice(0, 6).toUpperCase() || "000000"}`}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-300 font-mono w-full sm:w-auto flex-1 min-w-0"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`EFC-TOURNOI-${tournament.id?.slice(0, 6).toUpperCase() || "000000"}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg border border-gray-700 text-sm transition"
            >
              {copied ? "Copié !" : "Copier"}
            </button>
          </div>
          <LaunchButton />
        </div>
      </div>
    </div>
  );
}
