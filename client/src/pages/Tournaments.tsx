import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

export default function Tournaments() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ game: "", level: "", region: "", status: "", format: "", sort: "newest" });

  useEffect(() => {
    setLoading(true);
    api.tournaments.list({ ...filters, search } as any)
      .then(setTournaments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, filters]);

  const games = [...new Set(tournaments.map((t) => t.game).filter(Boolean))];
  const regions = [...new Set(tournaments.map((t) => t.region).filter(Boolean))];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Tournois</h1>
        <div className="flex gap-2">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un tournoi..."
            className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 w-48 sm:w-64" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <select value={filters.game} onChange={(e) => setFilters({ ...filters, game: e.target.value })}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500">
          <option value="">Tous les jeux</option>
          {games.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={filters.level} onChange={(e) => setFilters({ ...filters, level: e.target.value })}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500">
          <option value="">Tous niveaux</option>
          <option value="beginner">Débutant</option>
          <option value="intermediate">Intermédiaire</option>
          <option value="advanced">Avancé</option>
          <option value="pro">Professionnel</option>
        </select>
        <select value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value })}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500">
          <option value="">Toutes régions</option>
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500">
          <option value="">Tous statuts</option>
          <option value="upcoming">Programmé</option>
          <option value="ongoing">En cours</option>
          <option value="completed">Terminé</option>
        </select>
        <select value={filters.format} onChange={(e) => setFilters({ ...filters, format: e.target.value })}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500">
          <option value="">Tous formats</option>
          <option value="single_elimination">Élimination directe</option>
          <option value="double_elimination">Double élimination</option>
          <option value="round_robin">Poule</option>
        </select>
        <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500">
          <option value="newest">Plus récents</option>
          <option value="oldest">Plus anciens</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Chargement...</div>
      ) : tournaments.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">Aucun tournoi trouvé</p>
          <p className="text-sm">Essayez de modifier vos filtres ou rechercher autre chose.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((t) => (
            <Link key={t.id} to={`/tournaments/${t.id}`}
              className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-purple-700 transition group">
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${t.status === "ongoing" ? "bg-green-900/50 text-green-400" : t.status === "completed" ? "bg-blue-900/50 text-blue-400" : "bg-yellow-900/50 text-yellow-400"}`}>
                    {t.status === "ongoing" ? "En cours" : t.status === "completed" ? "Terminé" : "À venir"}
                  </span>
                  {t.prizePool && <span className="text-yellow-500 font-semibold">{t.prizePool}</span>}
                </div>
                <h2 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition">{t.name}</h2>
                {t.game && <p className="text-gray-400 text-sm mb-1">{t.game}</p>}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{t._count?.teams || 0}/{t.maxTeams} équipes</span>
                  <span>{t.format === "single_elimination" ? "Élimination directe" : t.format === "double_elimination" ? "Double élimination" : "Poule"}</span>
                </div>
                {(t.level || t.region) && (
                  <div className="flex gap-2 mt-2">
                    {t.level && t.level !== "all" && <span className="text-[10px] bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded-full">{t.level}</span>}
                    {t.region && <span className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full">{t.region}</span>}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
