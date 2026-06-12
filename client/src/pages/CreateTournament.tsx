import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function CreateTournament() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    game: "",
    maxTeams: 16,
    minTeams: 2,
    prizePool: "",
    format: "single_elimination",
    level: "all",
    region: "",
    matchDuration: "",
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    allowDraw: false,
    registrationType: "auto",
    rules: "",
    startDate: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tournament = await api.tournaments.create(form);
      navigate(`/tournaments/${tournament.id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Créer un tournoi</h1>
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nom du tournoi *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Jeu</label>
            <input type="text" value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
              placeholder="eFootball, Valorant..." list="game-suggestions" />
            <datalist id="game-suggestions">
              <option value="eFootball" /><option value="League of Legends" /><option value="Valorant" />
              <option value="CS2" /><option value="Fortnite" /><option value="Rocket League" />
            </datalist>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500" rows={3} />
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-purple-500 rounded-full inline-block" />
            Paramètres du tournoi
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Format</label>
              <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500">
                <option value="single_elimination">Élimination directe</option>
                <option value="double_elimination">Double élimination</option>
                <option value="round_robin">Poule (Round Robin)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Niveau</label>
              <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500">
                <option value="all">Tous niveaux</option>
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Avancé</option>
                <option value="pro">Professionnel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Région</label>
              <input type="text" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}
                placeholder="Europe, Asie, Amérique..."
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Durée des matchs (minutes)</label>
              <input type="number" value={form.matchDuration} onChange={(e) => setForm({ ...form, matchDuration: e.target.value })}
                placeholder="Ex: 90"
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nombre max d'équipes</label>
              <input type="number" value={form.maxTeams} onChange={(e) => setForm({ ...form, maxTeams: parseInt(e.target.value) })}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500" min={2} max={128} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nombre min d'équipes</label>
              <input type="number" value={form.minTeams} onChange={(e) => setForm({ ...form, minTeams: parseInt(e.target.value) })}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500" min={2} />
            </div>
          </div>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-yellow-500 rounded-full inline-block" />
            Système de points
          </h3>
          <div className="grid sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Points victoire</label>
              <input type="number" value={form.pointsForWin} onChange={(e) => setForm({ ...form, pointsForWin: parseInt(e.target.value) || 0 })}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500" min={0} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Points match nul</label>
              <input type="number" value={form.pointsForDraw} onChange={(e) => setForm({ ...form, pointsForDraw: parseInt(e.target.value) || 0 })}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500" min={0} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Points défaite</label>
              <input type="number" value={form.pointsForLoss} onChange={(e) => setForm({ ...form, pointsForLoss: parseInt(e.target.value) || 0 })}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500" min={0} />
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.allowDraw} onChange={(e) => setForm({ ...form, allowDraw: e.target.checked })}
                  className="w-4 h-4 accent-purple-500" />
                <span className="text-sm text-gray-400">Matchs nuls autorisés</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-green-500 rounded-full inline-block" />
            Inscriptions
          </h3>
          <div>
            <select value={form.registrationType} onChange={(e) => setForm({ ...form, registrationType: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500">
              <option value="auto">Automatique (validation immédiate)</option>
              <option value="manual">Manuelle (approbation organisateur)</option>
            </select>
            <p className="text-[11px] text-gray-600 mt-1">
              {form.registrationType === "auto"
                ? "Les équipes sont automatiquement inscrites dès qu'elles rejoignent."
                : "L'organisateur doit approuver chaque inscription manuellement."}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Règles personnalisées</label>
          <textarea value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 font-mono text-sm" rows={6}
            placeholder={`- Durée des matchs: 90 minutes&#10;- Prolongations: non&#10;- Tirs au but: oui&#10;- Temps mort: 1 par équipe`} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Dotation (prize pool)</label>
            <input type="text" value={form.prizePool} onChange={(e) => setForm({ ...form, prizePool: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500" placeholder="Ex: 1000€" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Date de début</label>
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500" />
          </div>
        </div>

        <button type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition mt-6">
          Créer le tournoi
        </button>
      </form>
    </div>
  );
}
