import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function CreateTeam() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", tag: "", description: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const team = await api.teams.create(form);
      navigate(`/teams/${team.id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Créer une équipe</h1>
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nom de l'équipe *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Tag *</label>
          <input
            type="text"
            value={form.tag}
            onChange={(e) => setForm({ ...form, tag: e.target.value })}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            placeholder="Ex: ALPHA, T37, FNX"
            maxLength={6}
            required
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
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition mt-6"
        >
          Créer l'équipe
        </button>
      </form>
    </div>
  );
}
