import { Link, useNavigate } from "react-router-dom";

interface NavbarProps {
  user: { username: string } | null;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout();
    navigate("/");
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold text-purple-500">
              Compete.gg
            </Link>
            <div className="hidden md:flex gap-6">
              <Link to="/tournaments" className="text-gray-300 hover:text-white transition">
                Tournois
              </Link>
              <Link to="/teams" className="text-gray-300 hover:text-white transition">
                Équipes
              </Link>
              <Link to="/leaderboard" className="text-gray-300 hover:text-white transition">
                Classement
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition">
                  Dashboard
                </Link>
                <div className="flex items-center gap-2">
                  <Link to="/profile" className="text-purple-400 hover:text-purple-300 font-medium">
                    {user.username}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-red-400 transition"
                  >
                    Déconnexion
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white transition"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
