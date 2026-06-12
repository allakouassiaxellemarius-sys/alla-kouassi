import { useState } from "react";
import { api } from "../services/api";

export default function ReportButton({ targetId, targetType = "user" }: { targetId: string; targetType?: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setSending(true);
    try {
      await api.reports.create({ targetId, targetType, reason: reason.trim(), description: description.trim() || undefined });
      setDone(true);
      setTimeout(() => { setOpen(false); setDone(false); setReason(""); setDescription(""); }, 2000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs text-gray-600 hover:text-red-400 transition flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
        Signaler
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setOpen(false)}>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            {done ? (
              <div className="text-center py-4">
                <div className="text-lg mb-2">✅</div>
                <p className="text-green-400 text-sm font-medium">Signalement envoyé</p>
                <p className="text-[10px] text-gray-500 mt-1">Notre équipe va examiner votre signalement.</p>
              </div>
            ) : (
              <>
                <h3 className="font-semibold mb-1">Signaler</h3>
                <p className="text-xs text-gray-500 mb-4">Pourquoi signalez-vous cet élément ?</p>
                <div className="space-y-3">
                  <select value={reason} onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500">
                    <option value="">Choisir un motif...</option>
                    <option value="harassment">Harcèlement</option>
                    <option value="cheating">Triche / exploitation</option>
                    <option value="abuse">Insultes / comportement abusif</option>
                    <option value="fake">Faux profil / usurpation</option>
                    <option value="other">Autre</option>
                  </select>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Détails (optionnel)..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" rows={3} />
                  <div className="flex gap-2">
                    <button onClick={() => setOpen(false)} className="flex-1 text-sm py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition">Annuler</button>
                    <button onClick={handleSubmit} disabled={sending || !reason}
                      className="flex-1 text-sm py-2 rounded-lg bg-red-700 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 text-white transition">
                      {sending ? "Envoi..." : "Signaler"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
