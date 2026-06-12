import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.password.forgot(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Mot de passe oublié</h1>
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">{error}</div>
      )}
      {sent ? (
        <div className="bg-green-900/30 border border-green-700/50 text-green-300 px-4 py-6 rounded-lg text-center">
          <div className="text-3xl mb-3">📧</div>
          <p className="text-sm mb-4">Si cet email est associé à un compte, un lien de réinitialisation a été envoyé dans vos notifications.</p>
          <Link to="/login" className="text-purple-400 hover:text-purple-300 text-sm font-medium">Retour à la connexion →</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Envoi..." : "Envoyer le lien"}
          </button>
        </form>
      )}
      <p className="text-center text-gray-500 mt-6">
        <Link to="/login" className="text-purple-400 hover:text-purple-300 text-sm">Retour à la connexion</Link>
      </p>
    </div>
  );
}
