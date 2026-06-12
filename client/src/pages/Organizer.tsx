import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import DisputeResolve from "../components/DisputeResolve";

export default function Organizer() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [allTournaments, setAllTournaments] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "validations" | "disputes" | "send">("overview");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    api.auth.me().then((u) => {
      setUser(u);
      return Promise.all([
        api.tournaments.list(),
        api.disputes.list().catch(() => []),
      ]);
    }).then(([tournaments, d]) => {
      setAllTournaments(tournaments);
      setDisputes(d);
    }).catch(() => navigate("/")).finally(() => setLoading(false));
  }, [navigate]);

  const refreshDisputes = useCallback(() => {
    api.disputes.list().then(setDisputes).catch(() => {});
  }, []);

  const organizedTournaments = allTournaments.filter((t: any) =>
    t.organizers?.some((o: any) => o.user?.id === user?.id || o.userId === user?.id)
  );

  if (loading) return <div className="text-center py-16 text-gray-400">Chargement...</div>;
  if (!user) return null;
  if (organizedTournaments.length === 0 && !loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Espace organisateur</h1>
        <p className="text-gray-500 mb-6">Vous n'organisez aucun tournoi pour le moment.</p>
        <Link to="/tournaments/create" className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition">
          Créer mon premier tournoi
        </Link>
      </div>
    );
  }

  const pendingScores = organizedTournaments.flatMap((t: any) =>
    (t.matches || []).filter((m: any) => m.scoreStatus === "pending")
  );
  const pendingDisputes = disputes.filter((d) => d.status === "open" || d.status === "pending");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">🎯 Espace organisateur</h1>
          <p className="text-gray-500 text-sm mt-1">{organizedTournaments.length} tournoi{organizedTournaments.length > 1 ? "x" : ""} organisé{organizedTournaments.length > 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard" className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition border border-gray-700">
            ← Mon espace
          </Link>
          <Link to="/tournaments/create" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm">
            + Créer un tournoi
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Tournois", value: organizedTournaments.length, color: "text-blue-400", icon: "🎯" },
          { label: "Scores en attente", value: pendingScores.length, color: pendingScores.length > 0 ? "text-yellow-400" : "text-gray-500", icon: "📝" },
          { label: "Litiges ouverts", value: pendingDisputes.length, color: pendingDisputes.length > 0 ? "text-red-400" : "text-gray-500", icon: "⚠️" },
          { label: "Matchs total", value: organizedTournaments.reduce((s, t) => s + (t.matches?.length || 0), 0), color: "text-green-400", icon: "⚔️" },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
            <div className="text-lg mb-1">{s.icon}</div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-800 pb-1 overflow-x-auto">
        {[
          { id: "overview" as const, label: "Vue d'ensemble" },
          { id: "validations" as const, label: `Scores à valider (${pendingScores.length})` },
          { id: "disputes" as const, label: `Litiges (${pendingDisputes.length})` },
          { id: "send" as const, label: "Envoyer une consigne" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`text-xs px-3 py-2 rounded-t-lg transition whitespace-nowrap ${tab === t.id ? "bg-gray-800 text-white border-b-2 border-purple-500" : "text-gray-500 hover:text-gray-300"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {organizedTournaments.map((t) => {
            const teams = t.teams || [];
            const matches = t.matches || [];
            const completed = matches.filter((m: any) => m.status === "completed").length;
            const pending = matches.filter((m: any) => m.scoreStatus === "pending").length;
            return (
              <div key={t.id} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Link to={`/tournaments/${t.id}`} className="font-bold hover:text-purple-400 transition truncate">{t.name}</Link>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    t.status === "ongoing" ? "bg-green-900/50 text-green-400" :
                    t.status === "completed" ? "bg-blue-900/50 text-blue-400" :
                    "bg-yellow-900/50 text-yellow-400"
                  }`}>{t.status === "ongoing" ? "En cours" : t.status === "completed" ? "Terminé" : "À venir"}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span>{teams.length}/{t.maxTeams} équipes</span>
                  <span>{completed}/{matches.length} matchs</span>
                  {pending > 0 && <span className="text-yellow-400">{pending} en attente</span>}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Link to={`/tournaments/${t.id}`} className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition">
                    Gérer
                  </Link>
                  {t.status === "ongoing" && (
                    <>
                      <button onClick={() => { setTab("send"); }} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg transition">
                        📢 Consigne
                      </button>
                      <button onClick={async () => {
                        if (!confirm("Clôturer ce tournoi ? Les matchs restants seront ignorés.")) return;
                        try {
                          await api.tournaments.close(t.id);
                          const tournaments = await api.tournaments.list();
                          setAllTournaments(tournaments);
                        } catch (err: any) { alert(err.message); }
                      }} className="text-xs bg-red-900/50 hover:bg-red-800 text-red-400 px-3 py-1.5 rounded-lg transition">
                        Clôturer
                      </button>
                    </>
                  )}
                  {t.status === "upcoming" && (
                    <button onClick={async () => {
                      if (!confirm("Supprimer définitivement ce tournoi ? Cette action est irréversible.")) return;
                      try {
                        await api.tournaments.delete(t.id);
                        const tournaments = await api.tournaments.list();
                        setAllTournaments(tournaments);
                      } catch (err: any) { alert(err.message); }
                    }} className="text-xs bg-red-950/50 hover:bg-red-900 text-red-500 px-3 py-1.5 rounded-lg transition">
                      Supprimer
                    </button>
                  )}
                  {t.status === "upcoming" && teams.length >= 2 && (
                    <button onClick={async () => {
                      if (!confirm("Générer les brackets ?")) return;
                      try {
                        await api.tournaments.generateBrackets(t.id);
                        const tournaments = await api.tournaments.list();
                        setAllTournaments(tournaments);
                      } catch (err: any) { alert(err.message); }
                    }} className="text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition">
                      Générer les matchs
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "validations" && (
        <div>
          {pendingScores.length === 0 ? (
            <div className="bg-gray-900/60 border border-dashed border-gray-700 rounded-xl p-6 text-center text-gray-500 text-sm">
              Aucun score en attente de validation
            </div>
          ) : (
            <div className="space-y-2">
              {pendingScores.map((m: any) => {
                const t = organizedTournaments.find((ot) => ot.id === m.tournamentId);
                const team1 = t?.teams?.find((tt: any) => tt.teamId === m.team1Id)?.team;
                const team2 = t?.teams?.find((tt: any) => tt.teamId === m.team2Id)?.team;
                return (
                  <div key={m.id} className="bg-yellow-900/10 border border-yellow-800/30 rounded-lg p-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{t?.name} · Round {m.round}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{team1?.name || "TBD"} {m.score1 ?? "?"} – {m.score2 ?? "?"} {team2?.name || "TBD"}</div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={async () => {
                        try {
                          await api.matches.approveScore(m.id);
                          const tournaments = await api.tournaments.list();
                          setAllTournaments(tournaments);
                        } catch (err: any) { alert(err.message); }
                      }} className="text-xs px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-lg transition">
                        Approuver
                      </button>
                      <Link to={`/tournaments/${t?.id}`} className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition">
                        Voir
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "disputes" && (
        <div>
          {pendingDisputes.length === 0 ? (
            <div className="bg-gray-900/60 border border-dashed border-gray-700 rounded-xl p-6 text-center text-gray-500 text-sm">
              Aucun litige en attente
            </div>
          ) : (
            <div className="space-y-2">
              {pendingDisputes.map((d) => (
                <DisputeResolve key={d.id} dispute={d} onResolved={refreshDisputes} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "send" && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 max-w-lg">
          <h3 className="font-semibold mb-1">📢 Envoyer une consigne</h3>
          <p className="text-xs text-gray-500 mb-4">Le message sera notifié à tous les participants du tournoi.</p>
          <SendForm tournaments={organizedTournaments} />
        </div>
      )}
    </div>
  );
}

function SendForm({ tournaments }: { tournaments: any[] }) {
  const [tournamentId, setTournamentId] = useState(tournaments[0]?.id || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSend = async () => {
    if (!tournamentId || !subject.trim() || !message.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await api.tournaments.sendInstructions(tournamentId, subject.trim(), message.trim());
      setResult({ type: "success", text: res.message });
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setResult({ type: "error", text: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {result && (
        <div className={`p-3 rounded-lg text-sm mb-4 ${result.type === "success" ? "bg-green-900/30 text-green-400 border border-green-800" : "bg-red-900/30 text-red-400 border border-red-800"}`}>
          {result.text}
        </div>
      )}
      <div className="space-y-3">
        <select value={tournamentId} onChange={(e) => setTournamentId(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>{t.name} ({t.status === "ongoing" ? "En cours" : t.status === "completed" ? "Terminé" : "À venir"})</option>
          ))}
        </select>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Objet de la consigne" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Votre message aux participants..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none" />
        <button onClick={handleSend} disabled={sending || !tournamentId || !subject.trim() || !message.trim()} className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium text-sm transition">
          {sending ? "Envoi en cours..." : "Envoyer à tous les participants"}
        </button>
      </div>
    </>
  );
}
