import { useState } from "react";
import { api } from "../services/api";

interface DisputeResolveProps {
  dispute: any;
  onResolved: () => void;
}

export default function DisputeResolve({ dispute, onResolved }: DisputeResolveProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleResolve = async (status: string) => {
    setSubmitting(true);
    try {
      await api.disputes.resolve(dispute.id, status, status === "resolved" ? "Litige résolu" : "Litige rejeté");
      onResolved();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-yellow-900/10 border border-yellow-800/30 rounded-lg p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-medium">{dispute.reason}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            Signalé par {dispute.reporter?.username || "Inconnu"} · {new Date(dispute.createdAt).toLocaleString("fr-FR")}
          </div>
          {dispute.details && <div className="text-xs text-gray-400 mt-1 italic">"{dispute.details}"</div>}
        </div>
        {!open && (
          <button onClick={() => setOpen(true)} className="text-xs text-purple-400 hover:text-purple-300 shrink-0">
            Résoudre
          </button>
        )}
      </div>
      {open && (
        <div className="mt-3 pt-3 border-t border-yellow-800/30 flex gap-2">
          <button onClick={() => handleResolve("resolved")} disabled={submitting} className="text-xs px-3 py-1.5 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-white rounded-lg transition">
            {submitting ? "..." : "Accepter le litige"}
          </button>
          <button onClick={() => handleResolve("rejected")} disabled={submitting} className="text-xs px-3 py-1.5 bg-red-700 hover:bg-red-600 disabled:bg-gray-700 text-white rounded-lg transition">
            {submitting ? "..." : "Rejeter"}
          </button>
          <button onClick={() => setOpen(false)} className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg transition">
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}
