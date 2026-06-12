export default function PremiumGallery() {
  return (
    <div className="space-y-8">

      {/* ─ Section Hero Premium ─ */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-950 via-gray-900 to-amber-950/30 border border-amber-900/30 p-8 sm:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-amber-900/30 border border-amber-700/40 rounded-full px-4 py-1.5 text-xs text-amber-300 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            eFootball™ — Galerie Premium
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            L'élite du{" "}
            <span className="bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
              gaming compétitif
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl text-sm sm:text-base">
            Une expérience exclusive réservée aux meilleurs compétiteurs.
            Statistiques avancées, matchs en direct, et classements prestige.
          </p>
        </div>
      </section>

      {/* ─ Cartes Statistiques Premium ─ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Tournois Premium", value: "12", icon: "🏆", desc: "Cette saison" },
          { label: "Joueurs Élite", value: "2 847", icon: "👑", desc: "Inscrits" },
          { label: "Matchs en Direct", value: "6", icon: "⚡", desc: "Actuellement" },
          { label: "Prize Pool Total", value: "45 000€", icon: "💰", desc: "Distribution" },
        ].map((s) => (
          <div key={s.label} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-800 group-hover:border-amber-800/50 rounded-xl p-4 transition">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              <div className="text-[10px] text-amber-700/70 mt-1">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─ Cartes Tournois Premium ─ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-1 h-5 bg-gradient-to-b from-amber-400 to-yellow-600 rounded-full inline-block" />
            Tournois en direct
          </h3>
          <button className="text-xs text-amber-400 hover:text-amber-300 transition flex items-center gap-1">
            Voir tout →
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "eFootball Champions Cup", game: "eFootball™ 2025", teams: "32/64", prize: "15 000€", status: "En cours", round: "Quarts de finale", online: 128 },
            { name: "Pro League Saison 7", game: "eFootball™ 2025", teams: "16/32", prize: "8 000€", status: "Inscriptions", round: "Phase de groupes", online: 64 },
            { name: "Masters Series Paris", game: "eFootball™ 2025", teams: "24/48", prize: "12 000€", status: "En cours", round: "Demi-finales", online: 96 },
          ].map((card) => (
            <div key={card.name} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-800 hover:border-amber-800/40 rounded-xl overflow-hidden transition">
                <div className="h-24 bg-gradient-to-r from-gray-900 via-amber-950/30 to-gray-900 border-b border-gray-800 relative">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <div className="text-xs text-amber-500/70 font-mono">{card.game}</div>
                    <div className="text-sm font-bold text-white">{card.name}</div>
                  </div>
                  <div className={`absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full ${card.status === "En cours" ? "bg-green-900/60 text-green-400 border border-green-700/50" : "bg-amber-900/60 text-amber-400 border border-amber-700/50"}`}>
                    <span className="flex items-center gap-1">
                      {card.status === "En cours" && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
                      {card.status}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-center text-xs">
                    <div className="bg-gray-950/80 rounded-lg p-2 border border-gray-800">
                      <div className="text-gray-500">Équipes</div>
                      <div className="text-amber-300 font-bold">{card.teams}</div>
                    </div>
                    <div className="bg-gray-950/80 rounded-lg p-2 border border-gray-800">
                      <div className="text-gray-500">Prize Pool</div>
                      <div className="text-green-400 font-bold">{card.prize}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">{card.round}</span>
                    <span className="text-amber-600">{card.online} spectateurs</span>
                  </div>
                  <button className="w-full text-xs py-2 rounded-lg bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-medium transition shadow-lg shadow-amber-900/30">
                    Rejoindre le tournoi
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─ Matchs en Direct ─ */}
      <div className="relative bg-gradient-to-br from-gray-900/90 via-gray-950/90 to-amber-950/20 border border-gray-800 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent" />
        <div className="relative p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white">Matchs en Direct</h3>
            <span className="text-[10px] text-gray-600">· 3 matchs en cours</span>
          </div>
          <div className="divide-y divide-gray-800/50">
            {[
              { team1: "FC Barcelona", team2: "Real Madrid", score1: 2, score2: 1, time: "67'", round: "Finale" },
              { team1: "PSG", team2: "Bayern", score1: 1, score2: 1, time: "42'", round: "Demi-finale" },
              { team1: "AC Milan", team2: "Inter", score1: 0, score2: 2, time: "23'", round: "Quart" },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 group hover:bg-white/[0.02] -mx-5 px-5 transition cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-mono">{m.round}</span>
                    <span className="text-[10px] text-green-500/70 font-mono">{m.time}</span>
                  </div>
                  <div className="text-sm font-medium text-white group-hover:text-amber-300 transition truncate">{m.team1} vs {m.team2}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-lg font-bold font-mono">
                    <span className={m.score1 > m.score2 ? "text-amber-400" : "text-gray-500"}>{m.score1}</span>
                    <span className="text-gray-600 mx-1">-</span>
                    <span className={m.score2 > m.score1 ? "text-amber-400" : "text-gray-500"}>{m.score2}</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─ Classement Prestige ─ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-1 h-5 bg-gradient-to-b from-amber-400 to-yellow-600 rounded-full inline-block" />
            Classement Prestige
          </h3>
        </div>
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
          <div className="divide-y divide-gray-800/50">
            {[
              { rank: 1, name: "ThunderStrike", wins: 47, tier: "Légende", change: "up" as const },
              { rank: 2, name: "ShadowLegend", wins: 42, tier: "Légende", change: "up" as const },
              { rank: 3, name: "ElitePhoenix", wins: 38, tier: "Diamant", change: "down" as const },
              { rank: 4, name: "CrimsonTiger", wins: 35, tier: "Diamant", change: "same" as const },
              { rank: 5, name: "GoldenEagle", wins: 31, tier: "Platine", change: "up" as const },
            ].map((p) => (
              <div key={p.rank} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${p.rank <= 3 ? "bg-gradient-to-br from-amber-500 to-yellow-600 text-white" : "bg-gray-800 text-gray-400"}`}>
                  {p.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{p.name}</div>
                  <div className="text-[10px] text-gray-500">{p.tier} · {p.wins} victoires</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-400 border border-amber-800/30">{p.tier}</span>
                  <span className={`text-xs ${p.change === "up" ? "text-green-400" : p.change === "down" ? "text-red-400" : "text-gray-500"}`}>
                    {p.change === "up" ? "▲" : p.change === "down" ? "▼" : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─ Section Confiance ─ */}
      <div className="relative bg-gradient-to-br from-gray-900/90 via-gray-950/90 to-amber-950/10 border border-gray-800 rounded-xl p-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/3 via-transparent to-transparent" />
        <div className="relative">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-gradient-to-b from-amber-400 to-yellow-600 rounded-full inline-block" />
            Support & Confiance
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: "🛡️", title: "Anti-triche", desc: "Système anti-triche certifié" },
              { icon: "⚡", title: "Support 24/7", desc: "Assistance prioritaire dédiée" },
              { icon: "🔒", title: "Paiements Sécurisés", desc: "Transactions cryptées SSL" },
              { icon: "📊", title: "Statistiques Pro", desc: "Analyses avancées en temps réel" },
            ].map((item) => (
              <div key={item.title} className="bg-gray-950/60 backdrop-blur-sm border border-gray-800 hover:border-amber-800/30 rounded-lg p-3 transition group">
                <div className="text-xl mb-1 group-hover:scale-110 transition inline-block">{item.icon}</div>
                <div className="text-sm font-medium text-white">{item.title}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─ Footer ─ */}
      <div className="text-center py-4 border-t border-gray-800/50">
        <div className="text-[10px] text-gray-600 space-y-1">
          <p className="flex items-center justify-center gap-4">
            <span className="text-amber-600/50">eFootball™ Premium Gallery</span>
            <span>·</span>
            <span>Propulsé par la compétition</span>
            <span>·</span>
            <span className="text-amber-600/50">v2.0</span>
          </p>
          <p>© 2026 Competition Platform — Tous droits réservés</p>
        </div>
      </div>

    </div>
  );
}
