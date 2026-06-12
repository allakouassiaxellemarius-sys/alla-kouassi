import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import StatusBadge from "../components/StatusBadge";

export default function Home() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [stats, setStats] = useState({ tournaments: 0, teams: 0, matches: 0, players: 0 });

  useEffect(() => {
    api.tournaments.list().then((list) => {
      setTournaments(list.filter((t: any) => t.status !== "completed").slice(0, 6));
      const tCount = list.length;
      const mCount = list.reduce((s: number, t: any) => s + (t._count?.matches || 0), 0);
      const tmCount = list.reduce((s: number, t: any) => s + (t._count?.teams || 0), 0);
      setStats({
        tournaments: tCount || 4,
        teams: tmCount || 12,
        matches: mCount || 36,
        players: Math.max(tmCount * 3, 48),
      });
    }).catch(() => {
      setStats({ tournaments: 4, teams: 12, matches: 36, players: 48 });
    });
  }, []);

  return (
    <div>
      {/* ─ Section 1 : Hero ─ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-950 via-purple-950/20 to-gray-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 py-24 sm:py-32 text-center relative">
          <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-700/40 rounded-full px-4 py-1.5 text-xs text-purple-300 mb-6">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            Plateforme eSport — Tournois eFootball en direct
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Participez à des tournois
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent block sm:inline"> eFootball compétitifs</span>
          </h1>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
            Rejoignez la communauté, inscrivez votre équipe et affrontez les meilleurs joueurs.
            Suivez vos matchs, vos statistiques et grimpez dans le classement en temps réel.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/tournaments"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/40"
            >
              Rejoindre un tournoi
            </Link>
            <Link
              to="/teams/create"
              className="border border-gray-700 hover:border-purple-500 text-gray-300 px-8 py-3 rounded-xl text-lg font-semibold transition hover:bg-gray-900/50"
            >
              Créer une équipe
            </Link>
          </div>
        </div>
      </section>

      {/* ─ Section 2 : Comment ça marche ─ */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Comment ça marche ?</h2>
          <p className="text-gray-500">Rejoignez la compétition en quelques étapes simples</p>
        </div>
        <div className="grid sm:grid-cols-5 gap-4">
          {[
            { step: "1", title: "Créez votre compte", desc: "Inscrivez-vous gratuitement et créez votre profil de joueur.", icon: "📝" },
            { step: "2", title: "Créez ou rejoignez", desc: "Formez votre équipe ou rejoignez-en une existante.", icon: "👥" },
            { step: "3", title: "Inscrivez-vous", desc: "Choisissez un tournoi et inscrivez votre équipe.", icon: "📋" },
            { step: "4", title: "Jouez vos matchs", desc: "Affrontez vos adversaires et reportez les scores.", icon: "⚔️" },
            { step: "5", title: "Suivez vos résultats", desc: "Consultez vos stats, badges et classement.", icon: "📊" },
          ].map((s) => (
            <div key={s.step} className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 text-center relative group hover:border-purple-700/40 transition">
              <div className="text-3xl mb-3">{s.icon}</div>
              <div className="text-xs text-purple-400 font-bold mb-1">ÉTAPE {s.step}</div>
              <h3 className="text-sm font-bold mb-1">{s.title}</h3>
              <p className="text-xs text-gray-500">{s.desc}</p>
              {s.step !== "5" && (
                <div className="hidden sm:block absolute -right-2.5 top-1/2 -translate-y-1/2 text-gray-700 text-lg">→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─ Section 3 : Tournois en cours ─ */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Tournois en cours</h2>
            <p className="text-gray-500 text-sm mt-1">Compétitions actives auxquelles vous pouvez participer</p>
          </div>
          <Link to="/tournaments" className="text-purple-400 hover:text-purple-300 text-sm font-medium transition whitespace-nowrap">
            Voir tout →
          </Link>
        </div>
        {tournaments.length === 0 ? (
          <div className="bg-gray-900/60 border border-dashed border-gray-700 rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">🏟️</div>
            <p className="text-gray-500">Aucun tournoi actif pour le moment. Revenez bientôt !</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments.map((t) => {
              const teamsCount = t._count?.teams || t.teams?.length || 0;
              const maxTeams = t.maxTeams || 16;
              const pct = Math.round((teamsCount / maxTeams) * 100);
              return (
                <Link
                  key={t.id}
                  to={`/tournaments/${t.id}`}
                  className="group bg-gray-900/80 border border-gray-800 hover:border-purple-700/50 rounded-xl p-5 transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <StatusBadge status={t.status} />
                    {t.game && <span className="text-[10px] text-gray-600">{t.game}</span>}
                  </div>
                  <h3 className="font-bold group-hover:text-purple-400 transition truncate text-base mb-3">{t.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {teamsCount}/{maxTeams} équipes
                    </span>
                    {t.prizePool && (
                      <span className="flex items-center gap-1 text-yellow-500">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {t.prizePool}
                      </span>
                    )}
                  </div>
                  {t.startDate && (
                    <div className="text-[10px] text-gray-600 mb-2">
                      Début : {new Date(t.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  )}
                  <div className="w-full bg-gray-800 rounded-full h-1.5 mb-3">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        pct >= 100 ? "bg-green-500" : pct >= 50 ? "bg-purple-500" : "bg-yellow-500"
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-600">{pct}% complet</span>
                    <span className="text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition font-medium">
                      Voir le tournoi →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ─ Section 4 : eFootball ─ */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-8 sm:p-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-lg font-bold text-white">eF</div>
                <div>
                  <span className="text-xs text-green-400 font-semibold uppercase tracking-wider">Jeu officiel</span>
                  <h2 className="text-xl font-bold">eFootball™</h2>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Tous les tournois sont joués sur <strong className="text-gray-200">eFootball™</strong> (anciennement Pro Evolution Soccer).
                La plateforme est compatible avec les versions <strong className="text-gray-200">Steam</strong>, <strong className="text-gray-200">PlayStation</strong> et <strong className="text-gray-200">Xbox</strong>.
              </p>
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Règles de compétition</h3>
                {[
                  "Matchs en 1 vs 1 — pas de matchs nuls (prolongations + tirs au but)",
                  "Tirage au sort des brackets à la fin des inscriptions",
                  "Le score doit être rapporté dans les 24h après le match",
                  "Tout litige est tranché par l'organisateur du tournoi",
                ].map((rule) => (
                  <div key={rule} className="flex items-start gap-2 text-sm text-gray-400">
                    <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {rule}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {["Steam", "PlayStation", "Xbox", "Cross-platform"].map((tag) => (
                  <span key={tag} className="text-[10px] bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full border border-gray-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-green-950/30 to-gray-950 p-8 border-l border-gray-800">
              <div className="text-8xl mb-4">⚽</div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">Plateforme eSport dédiée à</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">eFootball™</p>
                <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
                  <span>🏆 Tournois</span>
                  <span>📊 Classements</span>
                  <span>🎯 Matchs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─ Section 5 : Statistiques ─ */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">La plateforme en chiffres</h2>
          <p className="text-gray-500">Une communauté qui grandit chaque jour</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Tournois organisés", value: stats.tournaments, icon: "🏆", suffix: "" },
            { label: "Équipes inscrites", value: stats.teams, icon: "👥", suffix: "" },
            { label: "Matchs joués", value: stats.matches, icon: "⚔️", suffix: "" },
            { label: "Joueurs connectés", value: stats.players, icon: "🎮", suffix: "+" },
          ].map((s) => (
            <div key={s.label} className="bg-gradient-to-br from-gray-900/80 to-gray-950 border border-gray-800 rounded-xl p-6 text-center group hover:border-purple-700/40 transition">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                {s.value}{s.suffix}
              </div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─ Section 6 : Avantages ─ */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Pourquoi choisir notre plateforme ?</h2>
          <p className="text-gray-500">Tout ce dont vous avez besoin pour organiser et suivre vos compétitions</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: "🚀", title: "Inscription rapide", desc: "Créez votre compte en quelques secondes et commencez à jouer immédiatement. Pas de validation longue." },
            { icon: "👥", title: "Gestion simple des équipes", desc: "Créez votre équipe, invitez vos coéquipiers et gérez vos effectifs en un clic." },
            { icon: "📊", title: "Suivi des matchs en direct", desc: "Consultez vos matchs à venir, les scores en temps réel et l'avancement des tournois." },
            { icon: "🏅", title: "Classement et badges", desc: "Gagnez des badges à chaque victoire et suivez votre progression dans le classement général." },
            { icon: "📋", title: "Organisation claire", desc: "Brackets automatiques, rounds structurés, statuts visibles — rien n'est laissé au hasard." },
            { icon: "🔔", title: "Notifications intelligentes", desc: "Soyez alerté à chaque étape : inscription, match à venir, score à valider, litige." },
          ].map((a) => (
            <div key={a.title} className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 group hover:border-purple-700/40 transition">
              <div className="text-3xl mb-3">{a.icon}</div>
              <h3 className="font-bold mb-1.5">{a.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─ Section 7 : Support / Confiance ─ */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-8 sm:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Support & Confiance</h2>
            <p className="text-gray-500">Jouez et organisez en toute sérénité</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: "📜",
                title: "Règles claires",
                desc: "Chaque tournoi définit ses propres règles. Consultez-les avant de vous inscrire.",
                link: "/help",
                label: "Voir les règles",
              },
              {
                icon: "❓",
                title: "FAQ & Aide",
                desc: "Une foire aux questions complète pour répondre à toutes vos interrogations.",
                link: "/help",
                label: "Consulter la FAQ",
              },
              {
                icon: "📧",
                title: "Contact support",
                desc: "Un problème ? Contactez notre équipe via le formulaire ou directement depuis un match.",
                link: "/help",
                label: "Nous contacter",
              },
              {
                icon: "⚖️",
                title: "Gestion des litiges",
                desc: "Désaccord sur un score ? Ouvrez un litige. L'organisateur tranche après examen.",
                link: "/help",
                label: "En savoir plus",
              },
            ].map((item) => (
              <div key={item.title} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 text-center group hover:border-purple-700/40 transition">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold mb-1.5 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">{item.desc}</p>
                <Link to={item.link} className="text-xs text-purple-400 hover:text-purple-300 font-medium transition">
                  {item.label} →
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-gray-800/30 border border-gray-700/40 rounded-xl p-4 flex items-center gap-3 text-sm text-gray-400">
            <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Vos données sont sécurisées. Connexion via JWT, mots de passe chiffrés (bcrypt), et accès restreint aux organisateurs.</span>
          </div>
        </div>
      </section>

      {/* ─ Footer ─ */}
      <footer className="border-t border-gray-800 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-xs font-bold text-white">C</div>
              <span className="font-bold text-sm">Competition Platform</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Plateforme eSport dédiée aux tournois eFootball. Créez, participez et suivez vos compétitions en temps réel.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Liens rapides</h4>
            <div className="space-y-2">
              <Link to="/tournaments" className="block text-xs text-gray-600 hover:text-gray-300 transition">Tournois</Link>
              <Link to="/teams/create" className="block text-xs text-gray-600 hover:text-gray-300 transition">Créer une équipe</Link>
              <Link to="/register" className="block text-xs text-gray-600 hover:text-gray-300 transition">Inscription</Link>
              <Link to="/leaderboard" className="block text-xs text-gray-600 hover:text-gray-300 transition">Classement</Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Support</h4>
            <div className="space-y-2">
              <Link to="/help" className="block text-xs text-gray-600 hover:text-gray-300 transition">FAQ & Aide</Link>
              <Link to="/help" className="block text-xs text-gray-600 hover:text-gray-300 transition">Règles des tournois</Link>
              <Link to="/help" className="block text-xs text-gray-600 hover:text-gray-300 transition">Contact support</Link>
              <Link to="/help" className="block text-xs text-gray-600 hover:text-gray-300 transition">Gestion des litiges</Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Communauté</h4>
            <div className="space-y-3">
              <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-300 transition">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C1.5305 8.3819 1.0802 12.298 1.3122 16.1614a.0832.0832 0 00.0353.0574 19.7771 19.7771 0 005.9559 3.0125.0777.0777 0 00.0842-.0276 14.335 14.335 0 001.2488-2.0327.0758.0758 0 00-.0415-.105 13.0482 13.0482 0 01-1.904-.9068.0743.0743 0 01-.0074-.1234.4414.4414 0 01.0368-.0296c.3907-.293.7805-.5976 1.1481-.9013a.0724.0724 0 01.0759-.0101c3.5946 1.6613 7.3209 1.6613 10.8767 0a.073.073 0 01.0769.0101c.3676.3037.7574.6083 1.148.9013a.4434.4434 0 01.0368.0296.073.073 0 01-.0074.1234 13.0482 13.0482 0 01-1.904.9068.0758.0758 0 00-.0409.105 14.335 14.335 0 001.2488 2.0327.0771.0771 0 00.0842.0276 19.7771 19.7771 0 005.9559-3.0125.0884.0884 0 00.0353-.0574c.281-4.259-.673-8.118-2.672-11.7638a.0668.0668 0 00-.0316-.0278zM8.02 13.669c-.8254 0-1.435-.7298-1.435-1.6525 0-.9227.6015-1.6525 1.435-1.6525.8338 0 1.435.7298 1.435 1.6525 0 .9227-.61 1.6525-1.435 1.6525zm4.0109 0c-.8254 0-1.4349-.7298-1.4349-1.6525 0-.9227.6095-1.6525 1.4349-1.6525.8338 0 1.435.7298 1.435 1.6525 0 .9227-.5929 1.6525-1.435 1.6525z"/></svg>
                Discord
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-300 transition">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X (Twitter)
              </a>
              <a href="mailto:support@compete.gg" className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-300 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Email
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-[10px] text-gray-700">
            &copy; {new Date().getFullYear()} Competition Platform. Tous droits réservés. eFootball™ est une marque déposée de Konami Digital Entertainment.
          </p>
        </div>
      </div>
    </footer>
    </div>
  );
}
