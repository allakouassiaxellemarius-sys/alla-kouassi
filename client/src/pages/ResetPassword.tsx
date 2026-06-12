import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { setError("Token manquant"); return; }
    setLoading(true);
    setError("");
    try {
      await api.password.reset(token, password);
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Nouveau mot de passe</h1>
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">{error}</div>
      )}
      {done ? (
        <div className="bg-green-900/30 border border-green-700/50 text-green-300 px-4 py-6 rounded-lg text-center">
          <div className="text-3xl mb-3">✅</div>
          <p className="text-sm">Mot de passe réinitialisé ! Redirection vers la connexion...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-purple-500"
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-sm">
                {showPwd ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Réinitialisation..." : "Réinitialiser"}
          </button>
        </form>
      )}
      <p className="text-center text-gray-500 mt-6">
        <Link to="/login" className="text-purple-400 hover:text-purple-300 text-sm">Retour à la connexion</Link>
      </p>
    </div>
  );
}
