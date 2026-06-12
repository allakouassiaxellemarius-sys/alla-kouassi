import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { user, token } = await api.auth.login({ email, password });
      localStorage.setItem("token", token);
      onLogin(user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Connexion</h1>
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
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
        <div>
          <label className="block text-sm text-gray-400 mb-1">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition"
        >
          Se connecter
        </button>
      </form>
      <p className="text-center text-gray-500 mt-6">
        Pas encore de compte ?{" "}
        <Link to="/register" className="text-purple-400 hover:text-purple-300">
          S'inscrire
        </Link>
      </p>
    </div>
  );
}
