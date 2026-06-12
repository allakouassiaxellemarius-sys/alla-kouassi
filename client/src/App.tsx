import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import I18nProvider from "./i18n/I18nProvider";
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
import Notifications from "./pages/Notifications";
import Help from "./pages/Help";
import Organizer from "./pages/Organizer";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Spectate from "./pages/Spectate";
import SplashScreen from "./components/SplashScreen";
import { api } from "./services/api";

export default function App() {
  const [splash, setSplash] = useState(!localStorage.getItem("splashDone"));
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleSplashFinish = () => {
    localStorage.setItem("splashDone", "1");
    setSplash(false);
  };

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

  if (splash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <I18nProvider>
      <Routes>
        <Route element={<Layout user={user} onLogout={() => setUser(null)} />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/register" element={<Register onLogin={setUser} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
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
          <Route path="/notifications" element={
            <ProtectedRoute user={user}>
              <Notifications />
            </ProtectedRoute>
          } />
          <Route path="/help" element={<Help />} />
          <Route path="/organizer" element={
            <ProtectedRoute user={user}>
              <Organizer />
            </ProtectedRoute>
          } />
          <Route path="/spectate/:matchId" element={<Spectate />} />
        </Route>
      </Routes>
    </I18nProvider>
  );
}
