import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

interface RegisterProps {
  onLogin: (user: any) => void;
}

export default function Register({ onLogin }: RegisterProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function getDeviceId(): string {
    let id = localStorage.getItem("deviceId");
    if (!id) { id = crypto.randomUUID(); localStorage.setItem("deviceId", id); }
    return id;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { user, token } = await api.auth.register({ email, username, password, deviceId: getDeviceId() });
      localStorage.setItem("token", token);
      onLogin(user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Inscription</h1>
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
          <label className="block text-sm text-gray-400 mb-1">Nom d'utilisateur</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Mot de passe</label>
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
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition"
        >
          S'inscrire
        </button>
      </form>
      <p className="text-center text-gray-500 mt-6">
        Déjà un compte ?{" "}
        <Link to="/login" className="text-purple-400 hover:text-purple-300">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
