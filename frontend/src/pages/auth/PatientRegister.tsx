import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/auth";
import "./PatientRegister.css";

const PatientRegister = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await authApi.register({ email, password, role: "patient" });
      navigate("/patient-login"); // Redirect to patient login after successful registration
    } catch (err) {
      setError("Failed to register. Please try again.");
    }
  };

  return (
    <div className="patient-register-container">
      <div className="patient-register-card">
        <h2>Patient Register</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>
          <button type="submit" className="patient-register-button">
            Register
          </button>
        </form>
        <div className="link-text">
          Already have an account? <a href="/patient-login">Login here</a>
        </div>
      </div>
    </div>
  );
};

export default PatientRegister;
