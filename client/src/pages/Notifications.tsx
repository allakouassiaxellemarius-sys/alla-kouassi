import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.notifications.list().then(setNotifications).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id: string) => {
    await api.notifications.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllRead = async () => {
    for (const n of notifications.filter((n) => !n.read)) {
      await api.notifications.markRead(n.id);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const grouped = notifications.reduce((acc: any, n) => {
    const date = new Date(n.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    if (!acc[date]) acc[date] = [];
    acc[date].push(n);
    return acc;
  }, {} as any);

  if (loading) return <div className="text-center py-16 text-gray-400">Chargement...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.some((n) => !n.read) && (
          <button onClick={handleMarkAllRead} className="text-sm text-purple-400 hover:text-purple-300 transition">
            Tout marquer comme lu
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="bg-gray-900/60 border border-dashed border-gray-700 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-gray-400 font-medium">Aucune notification</p>
          <p className="text-gray-600 text-sm mt-1">Vous recevrez des notifications ici quand vos matchs commencent</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]: [string, any]) => (
            <div key={date}>
              <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">{date}</h3>
              <div className="space-y-1">
                {items.map((n: any) => (
                  <div key={n.id} className={`bg-gray-900/60 border rounded-lg p-4 transition ${!n.read ? "border-purple-700/40 bg-purple-900/10" : "border-gray-800"}`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {n.type === "dispute" ? <span>⚠️</span> : n.type === "registration" ? <span>✅</span> : <span>ℹ️</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm">{n.title}</span>
                          <span className="text-[10px] text-gray-600 shrink-0">{new Date(n.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        {n.tournamentName && <span className="text-[10px] text-purple-400">{n.tournamentName}</span>}
                        <p className="text-sm text-gray-400 mt-1">{n.message}</p>
                        <div className="flex items-center gap-3 mt-2">
                          {n.link && (
                            <Link to={n.link} className="text-xs text-purple-400 hover:text-purple-300">
                              Voir les détails →
                            </Link>
                          )}
                          {!n.read && (
                            <button onClick={() => handleMarkRead(n.id)} className="text-xs text-gray-600 hover:text-gray-400">
                              Marquer comme lue
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
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
