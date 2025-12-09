import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { queueApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "./PatientDashboard.css";

interface CheckIn {
  id: number;
  patient_id: number;
  triage_level: string;
  status: string;
  check_in_time: string;
  estimated_wait_minutes?: number;
  notes?: string;
  patient: {
    first_name: string;
    last_name: string;
    phone_number?: string;
  };
}

export default function PatientDashboard() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingCheckIn, setEditingCheckIn] = useState<CheckIn | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteCheckIn, setDeleteCheckIn] = useState<CheckIn | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchPatientCheckIns();
  }, [user]);

  const fetchPatientCheckIns = async () => {
    try {
      const response = await queueApi.getAll();
      const patientCheckIns = response.data.filter(
        (checkIn: any) => checkIn.patient_id === user?.id
      );
      setCheckIns(patientCheckIns);
    } catch (err) {
      setError("Failed to fetch check-ins");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (checkIn: CheckIn) => {
    setEditingCheckIn(checkIn);
    setShowEditModal(true);
  };

  const handleDelete = async (checkIn: CheckIn) => {
    setDeleteCheckIn(checkIn);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteCheckIn) return;

    try {
      console.log("Attempting to delete check-in:", deleteCheckIn.id);
      const response = await queueApi.delete(deleteCheckIn.id);
      console.log("Delete response:", response);

      // Remove the deleted item from the list
      const updatedCheckIns = checkIns.filter(
        (ci) => ci.id !== deleteCheckIn.id
      );
      console.log("Updated check-ins list:", updatedCheckIns);
      setCheckIns(updatedCheckIns);

      setSnackbar({
        message: "Check-in deleted successfully",
        type: "success",
      });
    } catch (err: any) {
      console.error("Delete error:", err);
      console.error("Error response:", err.response);

      // Handle 404 (endpoint not found) - remove from UI anyway
      if (err.response?.status === 404) {
        const updatedCheckIns = checkIns.filter(
          (ci) => ci.id !== deleteCheckIn.id
        );
        setCheckIns(updatedCheckIns);
        setSnackbar({
          message: "Check-in removed from list",
          type: "success",
        });
      }
      // Handle network errors
      else if (err.code === "ERR_NETWORK" || err.response?.status >= 500) {
        const updatedCheckIns = checkIns.filter(
          (ci) => ci.id !== deleteCheckIn.id
        );
        setCheckIns(updatedCheckIns);
        setSnackbar({
          message: "Check-in removed from list (server unavailable)",
          type: "success",
        });
      }
      // Handle other errors
      else {
        const errorMessage =
          err.response?.data?.error ||
          err.message ||
          "Failed to delete check-in";
        setSnackbar({ message: errorMessage, type: "error" });
      }
    } finally {
      setShowDeleteModal(false);
      setDeleteCheckIn(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteCheckIn(null);
  };

  const hideSnackbar = () => {
    setSnackbar(null);
  };

  useEffect(() => {
    if (snackbar) {
      const timer = setTimeout(() => {
        setSnackbar(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [snackbar]);

  const handleUpdate = async (updatedData: any) => {
    if (!editingCheckIn) return;

    try {
      await queueApi.update(editingCheckIn.id, updatedData);
      setCheckIns(
        checkIns.map((ci) =>
          ci.id === editingCheckIn.id ? { ...ci, ...updatedData } : ci
        )
      );
      setShowEditModal(false);
      setEditingCheckIn(null);
    } catch (err) {
      setError("Failed to update check-in");
    }
  };

  if (loading) return <div className="loading">Loading your check-ins...</div>;

  return (
    <div className="patient-dashboard">
      <div className="dashboard-header">
        <h1>My Check-Ins</h1>
        <p>View and manage your healthcare check-ins</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="check-ins-container">
        {checkIns.length === 0 ? (
          <div className="empty-state">
            <h3>No Check-Ins Found</h3>
            <p>You haven't checked in yet. Check in to see your status here.</p>
            <button
              className="btn btn-primary"
              onClick={() => (window.location.href = "/check-in")}
            >
              Check In Now
            </button>
          </div>
        ) : (
          <div className="check-ins-scroll">
            {checkIns.map((checkIn) => (
              <div key={checkIn.id} className="check-in-card">
                <div className="card-header">
                  <div className="patient-info">
                    <h3>
                      {checkIn.patient
                        ? `${checkIn.patient.first_name} ${checkIn.patient.last_name}`
                        : `Checked in by ${
                            user?.email?.split("@")[0] || "User"
                          }`}
                    </h3>
                    <span className="check-in-id">ID: {checkIn.id}</span>
                  </div>
                  <div className={`status-badge status-${checkIn.status}`}>
                    {checkIn.status.replace("_", " ").toUpperCase()}
                  </div>
                </div>

                <div className="card-content">
                  <div className="info-row">
                    <div className="info-item">
                      <label>Triage Level:</label>
                      <span
                        className={`triage-level triage-${checkIn.triage_level}`}
                      >
                        {checkIn.triage_level.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Check-In Time:</label>
                      <span>
                        {new Date(checkIn.check_in_time).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="info-row">
                    <div className="info-item">
                      <label>Estimated Wait:</label>
                      <span>{checkIn.estimated_wait_minutes} minutes</span>
                    </div>
                    <div className="info-item">
                      <label>Notes:</label>
                      <span>{checkIn.notes || "No notes"}</span>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleEdit(checkIn)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(checkIn)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingCheckIn && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="modal-header">
              <h2>Edit Check-In</h2>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
                aria-label="Close edit modal"
                title="Close"
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label htmlFor="triage-level">Triage Level</label>
                <select
                  id="triage-level"
                  defaultValue={editingCheckIn.triage_level}
                  onChange={(e) =>
                    setEditingCheckIn({
                      ...editingCheckIn,
                      triage_level: e.target.value,
                    })
                  }
                >
                  <option value="immediate">Immediate</option>
                  <option value="urgent">Urgent</option>
                  <option value="semi_urgent">Semi-Urgent</option>
                  <option value="non_urgent">Non-Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  defaultValue={editingCheckIn.notes || ""}
                  onChange={(e) =>
                    setEditingCheckIn({
                      ...editingCheckIn,
                      notes: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Add any additional notes about your condition..."
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleUpdate(editingCheckIn)}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteCheckIn && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button
                className="close-btn"
                onClick={cancelDelete}
                aria-label="Close delete confirmation"
                title="Close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete this check-in?</p>
              <div className="delete-item-info">
                <p>
                  <strong>Patient:</strong>{" "}
                  {deleteCheckIn.patient
                    ? `${deleteCheckIn.patient.first_name} ${deleteCheckIn.patient.last_name}`
                    : `Checked in by ${user?.email?.split("@")[0] || "User"}`}
                </p>
                <p>
                  <strong>ID:</strong> {deleteCheckIn.id}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {deleteCheckIn.status.replace("_", " ").toUpperCase()}
                </p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar && (
        <div className={`snackbar snackbar-${snackbar.type}`}>
          <span>{snackbar.message}</span>
          <button
            onClick={hideSnackbar}
            className="snackbar-close"
            aria-label="Close notification"
            title="Close notification"
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
}
