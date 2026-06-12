import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { playSound } from "../utils/sound";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const prevUnread = useRef(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    api.notifications.list().then(setNotifications).catch(() => {});
    api.notifications.unreadCount().then((r) => setUnread(r.count)).catch(() => {});
  }, []);

  useEffect(() => {
    if (unread > prevUnread.current) playSound("notification");
    prevUnread.current = unread;
  }, [unread]);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (token) {
        api.notifications.unreadCount().then((r) => setUnread(r.count)).catch(() => {});
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleMarkRead = async (id: string) => {
    await api.notifications.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative text-gray-400 hover:text-white transition p-1">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center font-bold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl shadow-black/50 z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Notifications</span>
            <Link to="/notifications" className="text-[10px] text-purple-400 hover:text-purple-300" onClick={() => setOpen(false)}>
              Voir tout
            </Link>
          </div>
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">Aucune notification</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {notifications.slice(0, 10).map((n) => (
                <div key={n.id} className={`p-3 hover:bg-gray-800/50 transition ${!n.read ? "bg-purple-900/10" : ""}`}>
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {n.type === "dispute" ? (
                        <span className="text-red-400 text-xs">⚠️</span>
                      ) : n.type === "registration" ? (
                        <span className="text-green-400 text-xs">✅</span>
                      ) : (
                        <span className="text-purple-400 text-xs">ℹ️</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium">{n.title}</div>
                      {n.tournamentName && <div className="text-[9px] text-purple-400 mt-0.5">{n.tournamentName}</div>}
                      <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{n.message}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        {n.link && (
                          <Link to={n.link} className="text-[10px] text-purple-400 hover:text-purple-300" onClick={() => setOpen(false)}>
                            Voir →
                          </Link>
                        )}
                        {!n.read && (
                          <button onClick={() => handleMarkRead(n.id)} className="text-[10px] text-gray-600 hover:text-gray-400">
                            Marquer lue
                          </button>
                        )}
                      </div>
                    </div>
                    <span className="text-[9px] text-gray-700 shrink-0">
                      {new Date(n.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
