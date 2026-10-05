import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <span className="brand">✔ Task Manager</span>
        <div className="navbar-user">
          <div className="user-info">
            <strong>{user?.name}</strong>
            <small>{user?.email}</small>
          </div>
          <button className="btn btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
