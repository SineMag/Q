import { useState, useEffect } from "react";
import { FaUser, FaHome, FaCreditCard } from "react-icons/fa";
import { patientsApi, queueApi } from "../services/api";
import "./PatientDashboard.css";

interface PatientProfile {
  id: number;
  patient_id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  address?: string;
  medical_aid?: string;
  payment_method?: string;
  profile_complete: boolean;
}

interface CheckIn {
  id: number;
  patient_id: number;
  triage_level: string;
  status: string;
  check_in_time: string;
  estimated_wait_minutes?: number;
  notes?: string;
}

export default function PatientDashboard() {
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(
    null
  );
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    address: "",
    medical_aid: "",
    payment_method: "cash",
  });

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      const storedInfo = localStorage.getItem("patientInfo");
      if (storedInfo) {
        const info = JSON.parse(storedInfo);
        setPatientProfile(info);

        if (!info.profile_complete) {
          setShowProfileModal(true);
        }
      }

      // Load check-ins if patient is logged in
      const response = await queueApi.getAll();
      const patientCheckIns = response.data.filter(
        (checkIn: any) => checkIn.patient_id === patientProfile?.id
      );
      setCheckIns(patientCheckIns);
    } catch (err) {
      setError("Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileComplete = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await patientsApi.updateProfile(patientProfile!.id, profileData);

      const updatedProfile = {
        ...patientProfile!,
        ...profileData,
        profile_complete: true,
      };

      setPatientProfile(updatedProfile);
      localStorage.setItem("patientInfo", JSON.stringify(updatedProfile));
      setShowProfileModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update profile");
    }
  };

  const calculateProfileCompletion = () => {
    if (!patientProfile) return 0;

    let completed = 0;
    const total = 4; // name, email, phone, profile info

    if (patientProfile.full_name) completed++;
    if (patientProfile.email) completed++;
    if (patientProfile.phone_number) completed++;
    if (patientProfile.profile_complete) completed++;

    return (completed / total) * 100;
  };

  const completionPercentage = calculateProfileCompletion();

  if (loading) return <div className="loading">Loading your dashboard...</div>;

  return (
    <div className="patient-dashboard">
      {/* Patient ID Alert */}
      {patientProfile && !patientProfile.profile_complete && (
        <div className="patient-id-alert">
          <div className="alert-content">
            <div className="patient-id-display">
              <h3>Your Patient ID: {patientProfile.patient_id}</h3>
              <p>Please complete your profile to access all features</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowProfileModal(true)}
            >
              Complete Profile
            </button>
          </div>
        </div>
      )}

      <div className="dashboard-header">
        <h1>Welcome, {patientProfile?.full_name || "Patient"}</h1>
        <p>Manage your healthcare journey</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Profile Completion Card */}
      <div className="profile-completion-card">
        <h2>Profile Completion</h2>
        <div className="completion-progress">
          <div className="progress-bar">
            <div
              className={`progress-fill progress-${Math.round(
                completionPercentage
              )}`}
            />
          </div>
          <span className="progress-text">
            {Math.round(completionPercentage)}% Complete
          </span>
        </div>
        <div className="completion-items">
          <div
            className={`completion-item ${
              patientProfile?.full_name ? "completed" : ""
            }`}
          >
            <FaUser /> Basic Information
          </div>
          <div
            className={`completion-item ${
              patientProfile?.email ? "completed" : ""
            }`}
          >
            <FaUser /> Contact Details
          </div>
          <div
            className={`completion-item ${
              patientProfile?.profile_complete ? "completed" : ""
            }`}
          >
            <FaHome /> Address Information
          </div>
          <div
            className={`completion-item ${
              patientProfile?.profile_complete ? "completed" : ""
            }`}
          >
            <FaCreditCard /> Payment Method
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button
          className="action-card"
          onClick={() => (window.location.href = "/check-in")}
        >
          <h3>Check In</h3>
          <p>Start a new visit</p>
        </button>

        <button
          className="action-card"
          onClick={() => (window.location.href = "/healthcare-communication")}
        >
          <h3>AI Assistant</h3>
          <p>Get medical help</p>
        </button>
      </div>

      {/* Recent Check-ins */}
      <div className="recent-checkins">
        <h2>Recent Check-ins</h2>
        {checkIns.length === 0 ? (
          <div className="empty-state">
            <p>No recent check-ins</p>
            <button
              className="btn btn-primary"
              onClick={() => (window.location.href = "/check-in")}
            >
              Check In Now
            </button>
          </div>
        ) : (
          <div className="checkins-list">
            {checkIns.slice(0, 3).map((checkIn) => (
              <div key={checkIn.id} className="checkin-item">
                <div className="checkin-info">
                  <h4>Check-in #{checkIn.id}</h4>
                  <p>{new Date(checkIn.check_in_time).toLocaleDateString()}</p>
                  <span className={`status-badge status-${checkIn.status}`}>
                    {checkIn.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                <div className="checkin-details">
                  <p>
                    Triage:{" "}
                    {checkIn.triage_level.replace("_", " ").toUpperCase()}
                  </p>
                  <p>Wait: {checkIn.estimated_wait_minutes || 15} mins</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Completion Modal */}
      {showProfileModal && (
        <div className="modal-overlay">
          <div className="profile-modal">
            <div className="modal-header">
              <h2>Complete Your Profile</h2>
              <p>
                Please provide additional information to complete your profile
              </p>
            </div>

            <form onSubmit={handleProfileComplete} className="profile-form">
              <div className="patient-id-highlight">
                <strong>Patient ID:</strong> {patientProfile?.patient_id}
              </div>

              <div className="form-group">
                <label htmlFor="address">Home Address *</label>
                <textarea
                  id="address"
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData({ ...profileData, address: e.target.value })
                  }
                  placeholder="Enter your full address"
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="medical_aid">Medical Aid Scheme</label>
                <input
                  id="medical_aid"
                  type="text"
                  value={profileData.medical_aid}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      medical_aid: e.target.value,
                    })
                  }
                  placeholder="Enter your medical aid scheme (optional)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="payment_method">
                  Preferred Payment Method *
                </label>
                <select
                  id="payment_method"
                  value={profileData.payment_method}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      payment_method: e.target.value,
                    })
                  }
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="medical_aid">Medical Aid</option>
                  <option value="insurance">Insurance</option>
                  <option value="card">Credit/Debit Card</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowProfileModal(false)}
                >
                  Skip for Now
                </button>
                <button type="submit" className="btn btn-primary">
                  Complete Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
