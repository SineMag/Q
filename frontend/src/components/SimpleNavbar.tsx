// frontend/src/components/SimpleNavbar.tsx
import { Link } from 'react-router-dom';
import './SimpleNavbar.css';

const SimpleNavbar = () => {
  return (
    <header className="simple-header">
      <div className="simple-navbar-container">
        <Link to="/" className="simple-logo">
          <h1>Q</h1>
          <span className="simple-logo-subtitle">Queue & Triage Companion</span>
        </Link>
        <nav className="simple-nav">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </div>
    </header>
  );
};

export default SimpleNavbar;
