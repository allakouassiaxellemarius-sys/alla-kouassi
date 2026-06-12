import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

const typeIcons: Record<string, string> = {
  match: "⚔️",
  info: "ℹ️",
  instruction: "📢",
  registration: "📝",
  reminder: "⏰",
  result: "🏆",
  score: "📊",
  urgent: "🚨",
  contact: "💬",
  tip: "💡",
};

const typeLabels: Record<string, string> = {
  match: "Match",
  info: "Information",
  instruction: "Consigne",
  registration: "Inscription",
  reminder: "Rappel",
  result: "Résultat",
  score: "Score",
  urgent: "Urgent",
  contact: "Contact",
  tip: "Astuce",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchNotifs = useCallback(() => {
    api.notifications.list().then(setNotifications).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  useEffect(() => {
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  const markRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const filtered = filter === "all" ? notifications : notifications.filter((n) => n.type === filter);
  const unread = notifications.filter((n) => !n.read).length;
  const types = [...new Set(notifications.map((n) => n.type))];

  if (loading) return <div className="text-center py-16 text-gray-400">Chargement...</div>;

  const groupByDate = (notifs: any[]) => {
    const groups: Record<string, any[]> = {};
    const now = new Date();
    const today = now.toDateString();
    const yesterday = new Date(now.getTime() - 86400000).toDateString();
    notifs.forEach((n) => {
      const date = new Date(n.createdAt).toDateString();
      const key = date === today ? "Aujourd'hui" : date === yesterday ? "Hier" : new Date(n.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });
    return groups;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          Notifications
          {unread > 0 && (
            <span className="text-sm font-normal text-gray-500">({unread} non lue{unread > 1 ? "s" : ""})</span>
          )}
        </h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter("all")}
          className={`text-xs px-3 py-1.5 rounded-lg transition ${filter === "all" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
          Toutes ({notifications.length})
        </button>
        {types.map((type) => (
          <button key={type} onClick={() => setFilter(type)}
            className={`text-xs px-3 py-1.5 rounded-lg transition ${filter === type ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            {typeIcons[type] || "🔔"} {typeLabels[type] || type} ({notifications.filter((n) => n.type === type).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-gray-900/60 border border-dashed border-gray-700 rounded-xl p-10 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <p className="text-gray-400 font-medium mb-1">Aucune notification</p>
          <p className="text-gray-600 text-sm">Vous serez notifié lors des matchs, scores, et mises à jour.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupByDate(filtered)).map(([dateLabel, notifs]) => (
            <div key={dateLabel}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{dateLabel}</h3>
              <div className="space-y-1">
                {(notifs as any[]).map((n) => (
                  <div key={n.id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition cursor-pointer ${n.read ? "bg-gray-900/30" : "bg-gray-900/70 border-l-2 border-purple-500"} hover:bg-gray-800/50`}
                    onClick={() => markRead(n.id)}
                  >
                    <span className="text-lg shrink-0 mt-0.5">{typeIcons[n.type] || "🔔"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm font-medium ${n.read ? "text-gray-300" : "text-white"}`}>{n.title}</span>
                        <span className="text-[10px] text-gray-600 shrink-0">{new Date(n.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      {n.tournamentName && (
                        <Link to={`/tournaments/${n.tournamentId}`} onClick={(e) => e.stopPropagation()}
                          className="text-[10px] text-purple-400 hover:text-purple-300 mt-1 inline-block">
                          Voir le tournoi →
                        </Link>
                      )}
                    </div>
                    {!n.read && (
                      <button onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                        className="text-[10px] text-gray-600 hover:text-white transition shrink-0">
                        Marquer lue
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
