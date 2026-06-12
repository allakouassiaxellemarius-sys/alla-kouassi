import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tournaments from "./pages/Tournaments";
import TournamentDetail from "./pages/TournamentDetail";
import CreateTournament from "./pages/CreateTournament";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import CreateTeam from "./pages/CreateTeam";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import { api } from "./services/api";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.auth
        .me()
        .then(setUser)
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<Layout user={user} onLogout={() => setUser(null)} />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/register" element={<Register onLogin={setUser} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} />
            </ProtectedRoute>
          }
        />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/tournaments/create" element={
          <ProtectedRoute user={user}>
            <CreateTournament />
          </ProtectedRoute>
        } />
        <Route path="/tournaments/:id" element={<TournamentDetail />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/create" element={
          <ProtectedRoute user={user}>
            <CreateTeam />
          </ProtectedRoute>
        } />
        <Route path="/teams/:id" element={<TeamDetail />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile/:id?" element={<Profile />} />
      </Route>
    </Routes>
  );
}
