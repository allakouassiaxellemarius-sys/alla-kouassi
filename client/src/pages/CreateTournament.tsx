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
    prizePool: "",
    format: "single_elimination",
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Créer un tournoi</h1>
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nom du tournoi *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Jeu</label>
          <input
            type="text"
            value={form.game}
            onChange={(e) => setForm({ ...form, game: e.target.value })}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            placeholder="Ex: League of Legends, Valorant, CS2..."
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre max d'équipes</label>
            <input
              type="number"
              value={form.maxTeams}
              onChange={(e) => setForm({ ...form, maxTeams: parseInt(e.target.value) })}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
              min={2}
              max={64}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Format</label>
            <select
              value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            >
              <option value="single_elimination">Élimination directe</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Dotation (prize pool)</label>
            <input
              type="text"
              value={form.prizePool}
              onChange={(e) => setForm({ ...form, prizePool: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
              placeholder="Ex: 1000€"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Date de début</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition mt-6"
        >
          Créer le tournoi
        </button>
      </form>
    </div>
  );
}
