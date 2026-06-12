import { useEffect, useState } from "react";

export default function CountdownTimer({ targetDate, label = "Début du tournoi" }: { targetDate: string; label?: string }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const target = new Date(targetDate).getTime();
  const diff = Math.max(0, target - now);

  if (diff === 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const items = [
    { value: days, label: "jours" },
    { value: hours, label: "heures" },
    { value: minutes, label: "minutes" },
    { value: seconds, label: "secondes" },
  ];

  return (
    <div className="bg-gradient-to-r from-purple-900/40 via-gray-900 to-purple-900/40 border border-purple-800/40 rounded-xl p-4 mb-4">
      <div className="text-xs text-gray-500 uppercase tracking-wider text-center mb-3">{label}</div>
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <div className="bg-gray-800/80 rounded-lg px-3 py-2 min-w-[48px] sm:min-w-[60px] border border-gray-700">
              <span className="text-xl sm:text-2xl font-bold text-purple-400 tabular-nums">
                {String(item.value).padStart(2, "0")}
              </span>
            </div>
            <div className="text-[10px] text-gray-500 mt-1">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
