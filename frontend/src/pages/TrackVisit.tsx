import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { queueApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  FaClock,
  FaUserMd,
  FaCheckCircle,
  FaHourglassHalf,
  FaBell,
} from "react-icons/fa";
import "./TrackVisit.css";

interface CheckIn {
  id: number;
  patient_id: number;
  triage_level: string;
  status: string;
  check_in_time: string;
  estimated_wait_minutes?: number;
  notes?: string;
  patient?: {
    first_name: string;
    last_name: string;
    phone_number?: string;
  };
}

export default function TrackVisit() {
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState<string[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientCode = searchParams.get("code");

  useEffect(() => {
    fetchCurrentCheckIn();
    const interval = setInterval(fetchCurrentCheckIn, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [patientCode]);

  const fetchCurrentCheckIn = async () => {
    try {
      const response = await queueApi.getAll();

      let targetPatientId: number | null = null;

      // If patient code is provided, use it; otherwise use logged-in user
      if (patientCode) {
        targetPatientId = parseInt(patientCode, 10);
        if (isNaN(targetPatientId)) {
          setError("Invalid patient code format");
          setLoading(false);
          return;
        }
      } else if (user) {
        targetPatientId = user.id;
      } else {
        setError("No patient code or user information available");
        setLoading(false);
        return;
      }

      const userCheckIns = response.data.filter(
        (checkIn: any) => checkIn.patient_id === targetPatientId
      );

      const activeCheckIn = userCheckIns.find(
        (checkIn: any) =>
          checkIn.status !== "completed" && checkIn.status !== "cancelled"
      );

      if (activeCheckIn) {
        const previousStatus = checkIn?.status;
        setCheckIn(activeCheckIn);

        // Add notification if status changed
        if (previousStatus && previousStatus !== activeCheckIn.status) {
          const statusMessage = getStatusMessage(activeCheckIn.status);
          setNotifications((prev) => [
            `Status updated to: ${statusMessage}`,
            ...prev.slice(0, 4),
          ]);
        }
      } else {
        // If no active check-in found for this patient code
        if (patientCode && userCheckIns.length === 0) {
          setError(`No check-in found for patient code: ${patientCode}`);
        } else if (patientCode && userCheckIns.length > 0) {
          setError(`No active visit found for patient code: ${patientCode}`);
        } else {
          setCheckIn(null);
        }
      }
    } catch (err) {
      console.error("Error fetching check-in:", err);
      setError("Failed to load visit information");
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = (status: string) => {
    return status.replace("_", " ").toUpperCase();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "waiting":
        return <FaHourglassHalf className="status-icon waiting" />;
      case "in_progress":
        return <FaUserMd className="status-icon in-progress" />;
      case "completed":
        return <FaCheckCircle className="status-icon completed" />;
      default:
        return <FaClock className="status-icon" />;
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case "waiting":
        return 2;
      case "in_progress":
        return 3;
      case "completed":
        return 4;
      default:
        return 1;
    }
  };

  const formatWaitTime = (minutes?: number) => {
    if (!minutes) return "Calculating...";
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading)
    return <div className="loading">Loading your visit status...</div>;

  return (
    <div className="track-visit">
      <div className="track-header">
        <h1>Track My Visit</h1>
        <p>Real-time updates on your healthcare visit</p>
      </div>

      {notifications.length > 0 && (
        <div className="notifications">
          {notifications.map((notification, index) => (
            <div key={index} className="notification">
              <FaBell className="notification-icon" />
              <span>{notification}</span>
            </div>
          ))}
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!checkIn ? (
        <div className="no-active-checkin">
          <div className="empty-state">
            <FaClock className="empty-icon" />
            <h3>No Active Visit</h3>
            <p>You don't have any active check-ins at the moment.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/check-in")}
            >
              Start Check-In
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/patient-dashboard")}
            >
              View My Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="visit-tracking">
          <div className="current-status card">
            <div className="status-header">
              <div className="status-info">
                <h2>Current Status</h2>
                <div className="status-display">
                  {getStatusIcon(checkIn.status)}
                  <span className="status-text">
                    {checkIn.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="wait-time">
                <FaClock />
                <span>
                  Est. Wait: {formatWaitTime(checkIn.estimated_wait_minutes)}
                </span>
              </div>
            </div>

            <div className="patient-info">
              <h3>
                {checkIn.patient
                  ? `${checkIn.patient.first_name} ${checkIn.patient.last_name}`
                  : `Checked in by ${user?.email?.split("@")[0] || "User"}`}
              </h3>
              <p>Check-in ID: {checkIn.id}</p>
              <p>
                Triage: {checkIn.triage_level.replace("_", " ").toUpperCase()}
              </p>
            </div>
          </div>

          <div className="progress-tracker card">
            <h3>Visit Progress</h3>
            <div className="progress-steps">
              {[
                {
                  step: 1,
                  title: "Check-In",
                  desc: "You've completed check-in",
                },
                {
                  step: 2,
                  title: "Waiting Room",
                  desc: "Waiting for clinician",
                },
                {
                  step: 3,
                  title: "In Progress",
                  desc: "Being seen by clinician",
                },
                {
                  step: 4,
                  title: "Visit Complete",
                  desc: "Your visit is finished",
                },
              ].map((item) => {
                const currentStep = getStatusStep(checkIn.status);
                const isActive = item.step === currentStep;
                const isCompleted = item.step < currentStep;

                return (
                  <div
                    key={item.step}
                    className={`progress-step ${isActive ? "active" : ""} ${
                      isCompleted ? "completed" : ""
                    }`}
                  >
                    <div className="step-indicator">
                      <div className="step-number">{item.step}</div>
                      {isCompleted && <FaCheckCircle className="step-check" />}
                    </div>
                    <div className="step-content">
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/patient-dashboard")}
            >
              View Full Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
