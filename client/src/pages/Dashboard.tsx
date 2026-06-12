import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import StatusBadge from "../components/StatusBadge";

interface DashboardProps {
  user: { id: string; username: string } | null;
}

export default function Dashboard({ user }: DashboardProps) {
  const navigate = useNavigate();
  const [allTournaments, setAllTournaments] = useState<any[]>([]);
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [myFullTeams, setMyFullTeams] = useState<any[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [orgMessages, setOrgMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.tournaments.list(),
      api.teams.list(),
      api.users.get(user.id),
      api.notifications.unreadCount().catch(() => ({ count: 0 })),
      api.notifications.list().catch(() => []),
    ]).then(([tournaments, teams, userData, notifCount, allNotifs]) => {
      setAllTournaments(tournaments);
      setMyTeams(teams.filter((t: any) =>
        t.members?.some((m: any) => m.userId === user.id)
      ));
      setMyFullTeams((userData as any).teams || []);
      setUnreadNotifs(notifCount.count);
      setOrgMessages(allNotifs.filter((n: any) => n.type === "instruction").slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;
  if (loading) return <div className="text-center py-16 text-gray-400">Chargement...</div>;

  const myTeamIds = myFullTeams.map((tm: any) => tm.teamId);
  const myTournaments = allTournaments.filter((t: any) =>
    (t.teams || []).some((tt: any) => myTeamIds.includes(tt.teamId))
  );
  const isOrganizer = allTournaments.some((t: any) =>
    t.organizers?.some((o: any) => o.user?.id === user.id || o.userId === user.id)
  );

  const myMatches = myTournaments.flatMap((t: any) =>
    (t.matches || []).filter((m: any) =>
      myTeamIds.includes(m.team1Id || m.team2Id)
    ).map((m: any) => ({ ...m, tournament: t }))
  );
  const activeMatches = myMatches.filter((m: any) => m.status === "ongoing");
  const upcomingMatches = myMatches.filter((m: any) => m.status === "scheduled");
  const completedMatches = myMatches.filter((m: any) => m.status === "completed").slice(0, 5);
  const nextMatch = upcomingMatches.sort((a: any, b: any) => a.round - b.round)[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header participant */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">👋 {user.username}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {myTournaments.length} tournoi{myTournaments.length > 1 ? "x" : ""} · {myTeams.length} équipe{myTeams.length > 1 ? "s" : ""}
            {unreadNotifs > 0 && (
              <span className="ml-3 text-purple-400">· {unreadNotifs} notification{unreadNotifs > 1 ? "s" : ""} non lue{unreadNotifs > 1 ? "s" : ""}</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/teams/create" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm">
            + Créer une équipe
          </Link>
          {isOrganizer && (
            <Link to="/organizer" className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-lg font-medium transition text-sm border border-gray-700">
              🎯 Espace organisateur
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Tournois en cours", value: myTournaments.filter((t) => t.status === "ongoing").length, color: "text-green-400", icon: "🏟️" },
          { label: "Matchs à venir", value: upcomingMatches.length, color: "text-yellow-400", icon: "📅" },
          { label: "En direct", value: activeMatches.length, color: "text-purple-400", icon: "⚡" },
          { label: "Notifications", value: unreadNotifs, color: unreadNotifs > 0 ? "text-red-400" : "text-gray-500", icon: "🔔" },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
            <div className="text-lg mb-1">{s.icon}</div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Prochain match */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Prochain match
        </h2>
        {nextMatch ? (
          <div className="bg-gradient-to-r from-purple-900/20 to-gray-900 border border-purple-700/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold">{nextMatch.tournament.name}</span>
              <span className="text-[10px] bg-yellow-900/50 text-yellow-400 px-2 py-0.5 rounded-full">Round {nextMatch.round}</span>
              {nextMatch.delayed && <StatusBadge status="delayed" />}
            </div>
            <div className="flex items-center gap-2 mb-3">
              {(() => {
                const t1 = nextMatch.tournament.teams?.find((tt: any) => tt.teamId === nextMatch.team1Id)?.team;
                const t2 = nextMatch.tournament.teams?.find((tt: any) => tt.teamId === nextMatch.team2Id)?.team;
                const isT1 = myTeamIds.includes(nextMatch.team1Id);
                const opponent = isT1 ? t2 : t1;
                return opponent ? <span className="text-xs text-gray-500">Adversaire : <span className="text-gray-300 font-medium">{opponent.name}</span></span> : null;
              })()}
            </div>
            <div className="flex items-center gap-4 mb-4">
              {(() => {
                const t1 = nextMatch.tournament.teams?.find((tt: any) => tt.teamId === nextMatch.team1Id)?.team;
                const t2 = nextMatch.tournament.teams?.find((tt: any) => tt.teamId === nextMatch.team2Id)?.team;
                const isT1 = myTeamIds.includes(nextMatch.team1Id);
                return (
                  <>
                    <span className={`text-lg font-bold ${isT1 ? "text-purple-400" : "text-gray-300"}`}>{t1?.name || "TBD"}</span>
                    <span className="text-gray-600 font-bold">VS</span>
                    <span className={`text-lg font-bold ${!isT1 ? "text-purple-400" : "text-gray-300"}`}>{t2?.name || "TBD"}</span>
                  </>
                );
              })()}
            </div>
            <div className="flex gap-2">
              <Link to={`/tournaments/${nextMatch.tournament.id}`} className="text-sm px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-medium">
                Accéder au match
              </Link>
              <button onClick={async () => {
                const reason = prompt("Raison du retard (optionnel):");
                try {
                  await api.matches.delay(nextMatch.id, reason || undefined);
                  window.location.reload();
                } catch (err: any) { alert(err.message); }
              }} className="text-sm px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition">
                Signaler un retard
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900/60 border border-dashed border-gray-700 rounded-xl p-8 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            {myTournaments.length > 0
              ? <p className="text-gray-500 text-sm">Tous vos matchs sont terminés. Consultez vos tournois pour voir la suite.</p>
              : <p className="text-gray-500 text-sm">Vous ne participez à aucun tournoi. <Link to="/tournaments" className="text-purple-400 hover:text-purple-300">Parcourir les tournois →</Link></p>
            }
          </div>
        )}
      </div>

      {/* Matchs en direct */}
      {activeMatches.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <h2 className="text-lg font-bold">Matchs en direct</h2>
          </div>
          <div className="space-y-2">
            {activeMatches.map((m: any) => {
              const t = m.tournament;
              const team1 = t?.teams?.find((tt: any) => tt.teamId === m.team1Id)?.team;
              const team2 = t?.teams?.find((tt: any) => tt.teamId === m.team2Id)?.team;
              return (
                <Link key={m.id} to={`/tournaments/${t?.id}`} className="block bg-gradient-to-r from-green-900/20 to-gray-900 border border-green-800/40 rounded-lg p-4 hover:border-green-700 transition">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-green-400">EN DIRECT</span>
                    <span className="text-xs text-gray-600">{t?.name} · Round {m.round}</span>
                  </div>
                  <div className="flex items-center gap-3 text-base">
                    <span className={`font-bold ${myTeamIds.includes(m.team1Id) ? "text-purple-400" : ""}`}>{team1?.name || "TBD"}</span>
                    <span className="text-gray-600">vs</span>
                    <span className={`font-bold ${myTeamIds.includes(m.team2Id) ? "text-purple-400" : ""}`}>{team2?.name || "TBD"}</span>
                    {m.score1 != null && <span className="text-lg font-bold text-purple-400 ml-auto tabular-nums">{m.score1} – {m.score2}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Mes résultats */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Mes résultats
          </h3>
          <div className="flex items-center gap-6 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{completedMatches.filter((m: any) => m.winnerId && myTeamIds.includes(m.winnerId)).length}</div>
              <div className="text-xs text-gray-500">Victoires</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{completedMatches.filter((m: any) => m.winnerId && !myTeamIds.includes(m.winnerId)).length}</div>
              <div className="text-xs text-gray-500">Défaites</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">{upcomingMatches.length + activeMatches.length}</div>
              <div className="text-xs text-gray-500">Restants</div>
            </div>
          </div>
          {completedMatches.length > 0 && (
            <div className="space-y-1">
              {completedMatches.slice(0, 3).map((m: any) => {
                const t = m.tournament;
                const team1 = t?.teams?.find((tt: any) => tt.teamId === m.team1Id)?.team;
                const team2 = t?.teams?.find((tt: any) => tt.teamId === m.team2Id)?.team;
                const won = myTeamIds.includes(m.winnerId);
                return (
                  <div key={m.id} className={`text-xs py-1.5 px-2 rounded ${won ? "bg-green-900/20" : "bg-red-900/20"}`}>
                    <span className={won ? "text-green-400" : "text-red-400"}>{won ? "V" : "D"}</span>
                    <span className="text-gray-500 ml-2">{team1?.name || "?"} {m.score1 ?? "?"}–{m.score2 ?? "?"} {team2?.name || "?"}</span>
                    <span className="text-gray-600 ml-2">· {t?.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Mes équipes
          </h3>
          {myTeams.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm mb-3">Vous n'êtes dans aucune équipe</p>
              <Link to="/teams/create" className="text-purple-400 hover:text-purple-300 text-sm font-medium">Créer une équipe →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {myTeams.map((t: any) => (
                <Link key={t.id} to={`/teams/${t.id}`} className="block bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{t.name}</div>
                      <div className="text-xs text-gray-500">[{t.tag}] · {t.members?.length || 0} membres</div>
                    </div>
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages organisateur */}
      {orgMessages.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Consignes des organisateurs
            </h3>
            <Link to="/notifications" className="text-xs text-purple-400 hover:text-purple-300">Voir tout</Link>
          </div>
          <div className="space-y-2">
            {orgMessages.map((n: any, i: number) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">
                  {n.tournamentName ? <span className="text-purple-400 font-medium">{n.tournamentName}</span> : null}
                  {n.createdAt && <span className="ml-2 text-gray-600">{new Date(n.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>}
                </div>
                <div className="text-sm text-gray-200">{n.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mes tournois */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Mes tournois</h3>
          <Link to="/tournaments" className="text-xs text-purple-400 hover:text-purple-300">Voir tout</Link>
        </div>
        {myTournaments.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm mb-3">Vous ne participez à aucun tournoi</p>
            <Link to="/tournaments" className="text-purple-400 hover:text-purple-300 text-sm font-medium">Parcourir les tournois →</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {myTournaments.map((t) => {
              const userTeam = (t.teams || []).find((tt: any) => myTeamIds.includes(tt.teamId));
              const mtchs = (t.matches || []).filter((m: any) => userTeam && (m.team1Id === userTeam.teamId || m.team2Id === userTeam.teamId));
              const wins = mtchs.filter((m: any) => m.winnerId === userTeam?.teamId).length;
              return (
                <Link key={t.id} to={`/tournaments/${t.id}`} className="block bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 transition">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{t.name}</div>
                      <div className="text-xs text-gray-500">{userTeam?.team?.name} · {mtchs.length} matchs · {wins}V</div>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                  {t.game && <div className="text-[10px] text-gray-600 mt-1">{t.game}</div>}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
