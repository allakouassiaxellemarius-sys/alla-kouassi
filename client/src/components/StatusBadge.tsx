const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  upcoming: { label: "Programmé", color: "bg-blue-900/50 text-blue-400 border-blue-700/50", dot: "bg-blue-500" },
  scheduled: { label: "Programmé", color: "bg-blue-900/50 text-blue-400 border-blue-700/50", dot: "bg-blue-500" },
  ongoing: { label: "En cours", color: "bg-green-900/50 text-green-400 border-green-700/50", dot: "bg-green-500" },
  active: { label: "En cours", color: "bg-green-900/50 text-green-400 border-green-700/50", dot: "bg-green-500" },
  completed: { label: "Terminé", color: "bg-gray-800 text-gray-400 border-gray-700/50", dot: "bg-gray-500" },
  pending: { label: "En attente", color: "bg-yellow-900/50 text-yellow-400 border-yellow-700/50", dot: "bg-yellow-500" },
  delayed: { label: "Bloqué", color: "bg-red-900/50 text-red-400 border-red-700/50", dot: "bg-red-500" },
  dispute: { label: "Litige", color: "bg-orange-900/50 text-orange-400 border-orange-700/50", dot: "bg-orange-500" },
  open: { label: "Litige", color: "bg-orange-900/50 text-orange-400 border-orange-700/50", dot: "bg-orange-500" },
  approved: { label: "Validé", color: "bg-green-900/50 text-green-400 border-green-700/50", dot: "bg-green-500" },
  rejected: { label: "Refusé", color: "bg-red-900/50 text-red-400 border-red-700/50", dot: "bg-red-500" },
  registered: { label: "Inscrit", color: "bg-green-900/50 text-green-400 border-green-700/50", dot: "bg-green-500" },
  resolved: { label: "Résolu", color: "bg-green-900/50 text-green-400 border-green-700/50", dot: "bg-green-500" },
};

interface StatusBadgeProps {
  status: string;
  pulse?: boolean;
}

export default function StatusBadge({ status, pulse }: StatusBadgeProps) {
  const cfg = statusConfig[status] || { label: status, color: "bg-gray-800 text-gray-500 border-gray-700/50", dot: "bg-gray-500" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${pulse ? "animate-pulse" : ""}`} />
      {cfg.label}
    </span>
  );
}
