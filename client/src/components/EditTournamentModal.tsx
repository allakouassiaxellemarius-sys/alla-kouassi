import { useState } from "react";
import { api } from "../services/api";

export default function EditTournamentModal({ tournament, onClose, onSaved }: { tournament: any; onClose: () => void; onSaved: (t: any) => void }) {
  const [form, setForm] = useState({
    name: tournament.name || "",
    description: tournament.description || "",
    game: tournament.game || "",
    maxTeams: tournament.maxTeams || 16,
    minTeams: tournament.minTeams || 2,
    prizePool: tournament.prizePool || "",
    format: tournament.format || "single_elimination",
    level: tournament.level || "all",
    region: tournament.region || "",
    matchDuration: tournament.matchDuration?.toString() || "",
    pointsForWin: tournament.pointsForWin ?? 3,
    pointsForDraw: tournament.pointsForDraw ?? 1,
    pointsForLoss: tournament.pointsForLoss ?? 0,
    allowDraw: tournament.allowDraw || false,
    registrationType: tournament.registrationType || "auto",
    rules: tournament.rules || "",
    startDate: tournament.startDate ? tournament.startDate.slice(0, 10) : "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await api.tournaments.update(tournament.id, form);
      onSaved(updated);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 overflow-y-auto py-8" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Modifier le tournoi</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition text-xl">&times;</button>
        </div>
        {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nom</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Jeu</label>
              <input type="text" value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" list="game-suggestions" />
              <datalist id="game-suggestions">
                <option value="eFootball" /><option value="League of Legends" /><option value="Valorant" />
                <option value="CS2" /><option value="Fortnite" /><option value="Rocket League" />
              </datalist>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" rows={2} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Format</label>
              <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500">
                <option value="single_elimination">Élimination directe</option>
                <option value="double_elimination">Double élimination</option>
                <option value="round_robin">Poule</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Niveau</label>
              <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500">
                <option value="all">Tous niveaux</option>
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Avancé</option>
                <option value="pro">Professionnel</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Région</label>
              <input type="text" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
            </div>
          </div>
          <div className="grid sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Max équipes</label>
              <input type="number" value={form.maxTeams} onChange={(e) => setForm({ ...form, maxTeams: parseInt(e.target.value) || 2 })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" min={2} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Min équipes</label>
              <input type="number" value={form.minTeams} onChange={(e) => setForm({ ...form, minTeams: parseInt(e.target.value) || 2 })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" min={2} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Durée match (min)</label>
              <input type="number" value={form.matchDuration} onChange={(e) => setForm({ ...form, matchDuration: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Prize pool</label>
              <input type="text" value={form.prizePool} onChange={(e) => setForm({ ...form, prizePool: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
            </div>
          </div>
          <div className="grid sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Points V</label>
              <input type="number" value={form.pointsForWin} onChange={(e) => setForm({ ...form, pointsForWin: parseInt(e.target.value) || 0 })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Points N</label>
              <input type="number" value={form.pointsForDraw} onChange={(e) => setForm({ ...form, pointsForDraw: parseInt(e.target.value) || 0 })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Points D</label>
              <input type="number" value={form.pointsForLoss} onChange={(e) => setForm({ ...form, pointsForLoss: parseInt(e.target.value) || 0 })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.allowDraw} onChange={(e) => setForm({ ...form, allowDraw: e.target.checked })}
                  className="w-4 h-4 accent-purple-500" />
                <span className="text-xs text-gray-400">Match nul</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Inscriptions</label>
            <select value={form.registrationType} onChange={(e) => setForm({ ...form, registrationType: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500">
              <option value="auto">Automatique</option>
              <option value="manual">Manuelle (approbation)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Règles</label>
            <textarea value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 font-mono" rows={4} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Date de début</label>
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition">Annuler</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition">
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
