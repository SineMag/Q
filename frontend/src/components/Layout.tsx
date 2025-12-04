import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

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
                to="/dashboard" 
                className={location.pathname === '/dashboard' ? 'active' : ''}
              >
                Dashboard
              </Link>
              <Link 
                to="/queue" 
                className={location.pathname === '/queue' ? 'active' : ''}
              >
                Queue
              </Link>
              <Link 
                to="/check-in" 
                className={location.pathname === '/check-in' ? 'active' : ''}
              >
                Check In
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="main">
        <div className="container">
          {children}
        </div>
      </main>
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Q Healthcare System | Built with care for better patient flow | StackSisters Team</p>
        </div>
      </footer>
    </div>
  );
}

