import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", bio: "", country: "", twitter: "", discord: "" });

  useEffect(() => {
    const userId = id || "me";
    setLoading(true);
    Promise.all([
      id ? api.users.get(userId) : api.users.getMe().catch(() => api.users.get(userId)),
      api.tournaments.list().catch(() => []),
    ]).then(([user, allTournaments]) => {
      setProfile(user);
      setEditForm({ username: user.username || "", bio: user.bio || "", country: user.country || "", twitter: user.twitter || "", discord: user.discord || "" });
      if (user) {
        const userTeamIds = (user.teams || []).map((t: any) => t.teamId);
        const involved = allTournaments.filter((t: any) =>
          (t.teams || []).some((tt: any) => userTeamIds.includes(tt.teamId))
        );
        Promise.all(
          involved.map((t: any) => api.tournaments.get(t.id).catch(() => null))
        ).then((full) => {
          setTournaments(full.filter(Boolean));
        });
      }
      setLoading(false);
    });
  }, [id]);

  const handleSave = async () => {
    try {
      const updated = await api.users.updateMe(editForm);
      setProfile({ ...profile, ...updated });
      setEditing(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Chargement...</div>;
  if (!profile) return <div className="text-center py-16 text-gray-400">Utilisateur non trouvé</div>;

  const totalMatches = tournaments.reduce((s, t) => s + (t.matches?.length || 0), 0);
  const totalWins = tournaments.reduce((s: number, t: any) => {
    const userTeamIds = (profile.teams || []).map((tm: any) => tm.teamId);
    return s + (t.matches || []).filter((m: any) => userTeamIds.includes(m.winnerId)).length;
  }, 0);
  const totalTournaments = tournaments.length;
  const totalTeams = profile.teams?.length || 0;
  const badges = profile.badges || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-2xl font-bold text-white shrink-0">
          {profile.username?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            {!id && (
              <button onClick={() => setEditing(!editing)}
                className="text-xs px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition">
                {editing ? "Annuler" : "Modifier"}
              </button>
            )}
          </div>
          {!id && <p className="text-sm text-gray-500">{profile.email}</p>}
          {profile.bio && <p className="text-sm text-gray-400 mt-1 max-w-lg">{profile.bio}</p>}
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-600">
            <span>{totalTeams} équipe{totalTeams > 1 ? "s" : ""} · {totalTournaments} tournoi{totalTournaments > 1 ? "x" : ""}</span>
            {profile.country && <span>📍 {profile.country}</span>}
            {profile.twitter && <span>🐦 {profile.twitter}</span>}
            {profile.discord && <span>💬 {profile.discord}</span>}
            {profile.createdAt && <span>Membre depuis {new Date(profile.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</span>}
          </div>
        </div>
      </div>

      {editing && !id && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 mb-8">
          <h3 className="font-semibold mb-4">Modifier le profil</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nom d'utilisateur</label>
              <input type="text" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Bio</label>
                <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" rows={2} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Pays</label>
                <input type="text" value={editForm.country} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Twitter</label>
                <input type="text" value={editForm.twitter} onChange={(e) => setEditForm({ ...editForm, twitter: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
              </div>
            </div>
            <button onClick={handleSave}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition">
              Enregistrer
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { value: totalTournaments, label: "Tournois", color: "text-purple-400", icon: "🎯" },
          { value: totalWins, label: "Victoires", color: "text-green-400", icon: "🏆" },
          { value: totalMatches, label: "Matchs", color: "text-blue-400", icon: "⚔️" },
          { value: totalTeams, label: "Équipes", color: "text-yellow-400", icon: "👥" },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-lg mb-1">{s.icon}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {badges.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>🏅</span>
            Badges et récompenses
          </h2>
          <div className="flex flex-wrap gap-2">
            {badges.map((b: any) => (
              <div key={b.id} className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-lg px-3 py-2">
                <span className="text-lg">{b.icon}</span>
                <div>
                  <div className="text-xs font-medium">{b.name}</div>
                  <div className="text-[10px] text-gray-500">{b.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Équipes
          </h2>
          {profile.teams?.length > 0 ? (
            <div className="space-y-2">
              {profile.teams.map((tm: any) => (
                <Link key={tm.id} to={`/teams/${tm.teamId}`}
                  className="block bg-gray-900/60 border border-gray-800 rounded-lg p-3 hover:border-purple-700/50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{tm.team.name}</div>
                      <div className="text-xs text-gray-500">[{tm.team.tag}]</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${tm.role === "captain" ? "bg-yellow-900/30 text-yellow-400" : "bg-gray-800 text-gray-500"}`}>
                      {tm.role === "captain" ? "Capitaine" : "Membre"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Aucune équipe</p>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            Historique des tournois
          </h2>
          {tournaments.length > 0 ? (
            <div className="space-y-2">
              {tournaments.map((t: any) => {
                const userTeamIds = (profile.teams || []).map((tm: any) => tm.teamId);
                const myTeam = (t.teams || []).find((tt: any) => userTeamIds.includes(tt.teamId));
                const myMatches = (t.matches || []).filter((m: any) => myTeam && (m.team1Id === myTeam.teamId || m.team2Id === myTeam.teamId));
                const myWins = myMatches.filter((m: any) => m.winnerId === myTeam?.teamId).length;
                const myLosses = myMatches.filter((m: any) => m.winnerId && m.winnerId !== myTeam?.teamId).length;
                return (
                  <Link key={t.id} to={`/tournaments/${t.id}`}
                    className="block bg-gray-900/60 border border-gray-800 rounded-lg p-3 hover:border-purple-700/50 transition">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{t.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${t.status === "completed" ? "bg-green-900/30 text-green-400" : t.status === "ongoing" ? "bg-yellow-900/30 text-yellow-400" : "bg-blue-900/30 text-blue-400"}`}>
                        {t.status === "completed" ? "Terminé" : t.status === "ongoing" ? "En cours" : "À venir"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {myTeam && <span>Avec {myTeam.team.name}</span>}
                      {myMatches.length > 0 && <span>{myMatches.length} matchs</span>}
                      {myWins > 0 && <span className="text-green-400">{myWins}V</span>}
                      {myLosses > 0 && <span className="text-red-400">{myLosses}D</span>}
                      {t.game && <span>{t.game}</span>}
                      {t.level && t.level !== "all" && <span className="text-purple-400">{t.level}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Aucun tournoi pour le moment</p>
          )}
        </div>
      </div>
    </div>
  );
}
