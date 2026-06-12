import { useState } from "react";
import { api } from "../services/api";

interface Props {
  matchId: string;
  onSent: () => void;
}

export default function ContactOrganizerButton({ matchId, onSent }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    setMsg(null);
    try {
      await api.matches.contactOrganizer(matchId, message.trim());
      setMsg({ type: "success", text: "Message envoyé à l'organisateur" });
      setMessage("");
      setTimeout(() => { setOpen(false); setMsg(null); }, 1500);
      onSent();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs text-gray-600 hover:text-purple-400 transition">
        Contacter l'organisateur
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-1">📩 Contacter l'organisateur</h3>
            <p className="text-xs text-gray-500 mb-4">Envoyez un message direct à l'organisateur du tournoi.</p>
            {msg && (
              <div className={`p-3 rounded-lg text-sm mb-4 ${msg.type === "success" ? "bg-green-900/30 text-green-400 border border-green-800" : "bg-red-900/30 text-red-400 border border-red-800"}`}>
                {msg.text}
              </div>
            )}
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Votre message..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none mb-3" />
            <div className="flex gap-2">
              <button onClick={() => setOpen(false)} className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
                Annuler
              </button>
              <button onClick={handleSend} disabled={sending || !message.trim()} className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-medium transition">
                {sending ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
