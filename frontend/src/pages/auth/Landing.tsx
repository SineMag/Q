import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Landing.css";

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      // Redirect logged-in users to their appropriate dashboard
      if (user.role === "admin") {
        navigate("/dashboard", { replace: true });
      } else if (user.role === "patient") {
        navigate("/patient-dashboard", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // Don't render landing page if user is logged in
  if (user) {
    return null;
  }

  return (
    <div className="landing">
      <main className="landing-main">
        <div className="container">
          <section className="hero">
            <h1>Welcome to Q Healthcare</h1>
            <p>
              Streamlined patient queue management and triage system for better
              healthcare delivery
            </p>
            <div className="cta-buttons">
              <button
                onClick={() => navigate("/login")}
                className="btn btn-primary"
              >
                Admin Portal
              </button>
              <button
                onClick={() => navigate("/patient-login")}
                className="btn btn-secondary"
              >
                Patient Portal
              </button>
            </div>
          </section>

          <section id="features" className="features">
            <h2>Features</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>Smart Queue Management</h3>
                <p>
                  Efficient patient flow with real-time queue tracking and
                  automated triage prioritization
                </p>
              </div>
              <div className="feature-card">
                <h3>Patient Check-in</h3>
                <p>
                  Quick and easy patient registration process with digital forms
                  and status updates
                </p>
              </div>
              <div className="feature-card">
                <h3>Real-time Updates</h3>
                <p>
                  Live queue status and wait time estimates for better patient
                  experience
                </p>
              </div>
              <div className="feature-card">
                <h3>Staff Management</h3>
                <p>
                  Optimized staff allocation and workload balancing for improved
                  healthcare efficiency
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Landing;
