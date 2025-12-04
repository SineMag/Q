import { Link, useLocation } from "react-router-dom";
import "./Layout.css";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              <h1>Q</h1>
              <span className="logo-subtitle">Queue & Triage Companion</span>
            </Link>
            <nav className="nav">
              <Link
                to="/patients"
                className={isActive("/patients") ? "active" : ""}
              >
                Patients
              </Link>
              <Link
                to="/dashboard"
                className={isActive("/dashboard") ? "active" : ""}
              >
                Dashboard
              </Link>
              <Link to="/queue" className={isActive("/queue") ? "active" : ""}>
                Queue
              </Link>
              <Link
                to="/check-in"
                className={isActive("/check-in") ? "active" : ""}
              >
                Check In
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="main">
        <div className="container">{children}</div>
      </main>
      <footer className="footer">
        <div className="container">
          <p>
            &copy; 2025 Q Healthcare System | Built with care for better patient
            flow | StackSisters Team
          </p>
        </div>
      </footer>
    </div>
  );
}
