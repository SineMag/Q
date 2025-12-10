import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { patientsApi } from "../services/api";
import "./PatientRegistration.css";

export default function PatientRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [patientId, setPatientId] = useState<string>("");

  const [formData, setFormData] = useState({
    full_name: "",
    national_id: "",
    password: "",
    confirmPassword: "",
    email: "",
    phone_number: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await patientsApi.register({
        full_name: formData.full_name,
        national_id: formData.national_id,
        password: formData.password,
        email: formData.email,
        phone_number: formData.phone_number,
      });

      setPatientId(response.data.patient_id);
      setSuccess(true);

      // Store patient info for dashboard
      localStorage.setItem(
        "patientInfo",
        JSON.stringify({
          id: response.data.id,
          patient_id: response.data.patient_id,
          full_name: formData.full_name,
          email: formData.email,
          profile_complete: false,
        })
      );
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    // Store patient data for dashboard
    localStorage.setItem(
      "patientData",
      JSON.stringify({
        patient_id: patientId,
        full_name: formData.full_name,
        email: formData.email,
      })
    );
    navigate("/patient-dashboard");
  };

  if (success) {
    return (
      <div className="registration-success">
        <div className="success-card">
          <h2>Registration Successful!</h2>
          <div className="patient-id-display">
            <h3>Your Patient ID:</h3>
            <div className="patient-id">{patientId}</div>
            <p className="id-notice">
              Please save this ID. You'll need it to complete your profile.
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleGoToDashboard}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-registration">
      <div className="registration-card">
        <h1>Patient Registration</h1>
        <p className="subtitle">
          Create your account to access healthcare services
        </p>

        <form onSubmit={handleSubmit} className="registration-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="full_name">Full Name *</label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="national_id">National/Passport ID *</label>
            <input
              id="national_id"
              name="national_id"
              type="text"
              value={formData.national_id}
              onChange={handleInputChange}
              placeholder="Enter your national ID or passport number"
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone_number">Phone Number *</label>
            <input
              id="phone_number"
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a password (min. 6 characters)"
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              className="input"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        <div className="login-link">
          Already have an account? <a href="/patient-login">Sign in</a>
        </div>
      </div>
    </div>
  );
}
