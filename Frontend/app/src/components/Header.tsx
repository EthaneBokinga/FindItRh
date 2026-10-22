import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../config";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="topbar">
      <Link to={ROUTES.candidates}><img src="/logo.jpeg" alt="Find it" className="topbar-logo" /></Link>
      <div className="topbar-user">
        {user?.picture && <img src={user.picture} alt="" referrerPolicy="no-referrer" className="avatar" />}
        <button className="icon-btn" onClick={logout} aria-label="Se déconnecter" title="Se déconnecter">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
