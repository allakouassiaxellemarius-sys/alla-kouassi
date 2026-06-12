import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

interface LayoutProps {
  user: { username: string } | null;
  onLogout: () => void;
}

export default function Layout({ user, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar user={user} onLogout={onLogout} />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
