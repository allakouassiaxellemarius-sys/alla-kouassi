import { useState } from "react";
import { api } from "../services/api";
import { playSound } from "../utils/sound";

export default function ScoreReportForm({
  match,
  isOrganizer,
  userTeamId,
  onScoreSubmitted,
}: {
  match: any;
  isOrganizer: boolean;
  userTeamId: string | null;
  onScoreSubmitted: () => void;
}) {
  const [score1, setScore1] = useState(match.score1 ?? "");
  const [score2, setScore2] = useState(match.score2 ?? "");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  if (match.status === "completed") return null;

  const userIsInMatch = userTeamId && (match.team1Id === userTeamId || match.team2Id === userTeamId);
  if (!userIsInMatch && !isOrganizer) return null;

  const handleSubmit = async () => {
    const s1 = parseInt(score1 as string);
    const s2 = parseInt(score2 as string);
    if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) {
      setMsg({ type: "error", text: "Scores invalides" });
      return;
    }
    if (s1 === s2) {
      setMsg({ type: "error", text: "Les scores ne peuvent pas être égaux (pas de match nul en élimination directe)" });
      return;
    }
      setSending(true);
      setMsg(null);
      try {
        await api.matches.updateScore(match.id, s1, s2);
        playSound("success");
        setMsg({ type: "success", text: "Score enregistré !" });
        onScoreSubmitted();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Erreur lors de l'envoi" });
    }
    setSending(false);
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-800">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
        {isOrganizer ? "Saisir le score" : "Signaler le résultat"}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={99}
          value={score1}
          onChange={(e) => setScore1(e.target.value)}
          className="w-14 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-center text-sm font-bold tabular-nums focus:outline-none focus:border-purple-500"
          placeholder="0"
        />
        <span className="text-gray-600 text-sm font-bold">–</span>
        <input
          type="number"
          min={0}
          max={99}
          value={score2}
          onChange={(e) => setScore2(e.target.value)}
          className="w-14 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-center text-sm font-bold tabular-nums focus:outline-none focus:border-purple-500"
          placeholder="0"
        />
        <button
          onClick={handleSubmit}
          disabled={sending}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
        >
          {sending ? "..." : isOrganizer ? "Valider" : "Envoyer"}
        </button>
        {!isOrganizer && userIsInMatch && (
          <span className="text-[10px] text-gray-600">(soumis à validation de l'organisateur)</span>
        )}
      </div>
      {msg && (
        <div className={`text-[10px] mt-1 ${
          msg.type === "success" ? "text-green-400" :
          msg.type === "error" ? "text-red-400" :
          "text-yellow-400"
        }`}>
          {msg.text}
        </div>
      )}
    </div>
  );
}
