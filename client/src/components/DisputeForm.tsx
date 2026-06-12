import { useState } from "react";
import { api } from "../services/api";

interface DisputeFormProps {
  matchId: string;
  tournamentId: string;
  onCreated: () => void;
}

export default function DisputeForm({ matchId, tournamentId, onCreated }: DisputeFormProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    setMsg(null);
    try {
      await api.disputes.create({ matchId, tournamentId, reason: reason.trim(), details: details.trim() || undefined });
      setMsg({ type: "success", text: "Litige soumis. Un organisateur va examiner votre demande." });
      setReason("");
      setDetails("");
      setOpen(false);
      onCreated();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs text-gray-600 hover:text-yellow-400 transition">
        Contester
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-1">Contester le résultat</h3>
            <p className="text-xs text-gray-500 mb-4">Expliquez pourquoi vous contestez ce match.</p>
            {msg && (
              <div className={`p-3 rounded-lg text-sm mb-4 ${msg.type === "success" ? "bg-green-900/30 text-green-400 border border-green-800" : "bg-red-900/30 text-red-400 border border-red-800"}`}>
                {msg.text}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Motif *</label>
                <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" required>
                  <option value="">Sélectionner un motif</option>
                  <option value="score_incorrect">Score incorrect</option>
                  <option value="forfait_invalide">Forfait invalide</option>
                  <option value="triche">Triche suspectée</option>
                  <option value="regle_non_respectee">Règle non respectée</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Détails (optionnel)</label>
                <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none" placeholder="Décrivez la situation..." />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
                  Annuler
                </button>
                <button type="submit" disabled={submitting || !reason.trim()} className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-medium transition">
                  {submitting ? "Envoi..." : "Soumettre le litige"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
