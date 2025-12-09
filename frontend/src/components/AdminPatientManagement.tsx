import React, { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import { patientsApi } from "../services/api";
import "./AdminPatientManagement.css";

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  phone_number?: string;
  email?: string;
  patient_id?: string;
  national_id?: string;
  passport_number?: string;
  created_at: string;
  updated_at: string;
}

interface PatientFormData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone_number: string;
  email: string;
  patient_id: string;
  national_id: string;
  passport_number: string;
  id_type: "national_id" | "passport_number";
}

export default function AdminPatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [patientPhone, setPatientPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("patient_id");
  const [assignedPatientId, setAssignedPatientId] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState<PatientFormData>({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    phone_number: "",
    email: "",
    patient_id: "",
    national_id: "",
    passport_number: "",
    id_type: "national_id",
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await patientsApi.getAll();
      setPatients(response.data);
      setFilteredPatients(response.data);
    } catch (err) {
      setError("Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const filtered = patients.filter((patient) => {
      const searchValue = term.toLowerCase();

      switch (searchType) {
        case "patient_id":
          return patient.patient_id?.toLowerCase().includes(searchValue);
        case "national_id":
          return patient.national_id?.toLowerCase().includes(searchValue);
        case "passport_number":
          return patient.passport_number?.toLowerCase().includes(searchValue);
        default:
          return false;
      }
    });

    setFilteredPatients(filtered);
  };

  const handleSearchTypeChange = (type: string) => {
    setSearchType(type);
    setSearchTerm("");
    setFilteredPatients(patients);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone_number) {
      setError("Phone number is required for SMS verification");
      return;
    }

    // Store form data and show verification modal
    setPatientPhone(formData.phone_number);

    // Generate and send 6-digit code (in real app, this would send SMS)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code); // Store for verification (in real app, this would be server-side)

    setSuccess(`Verification code sent to ${formData.phone_number}`);

    // Show SMS modal first, then verification modal
    console.log("Setting SMS modal to true");
    setShowSMSModal(true);

    setTimeout(() => {
      setShowSMSModal(false);
      setShowVerificationModal(true);
    }, 5000); // Show for 5 seconds, then switch to verification
  };

  const handleVerification = (e: React.FormEvent) => {
    e.preventDefault();

    const enteredCode = (e.target as any).code.value;

    if (enteredCode === verificationCode) {
      // Code verified, proceed with patient creation/update
      savePatient();
    } else {
      setError("Invalid verification code");
    }
  };

  const savePatient = async () => {
    try {
      // Generate Patient ID if not provided (for new patients)
      if (!editingPatient && !formData.patient_id) {
        const generatedId = `P${Date.now().toString().slice(-6)}`;
        const patientData = { ...formData, patient_id: generatedId };

        await patientsApi.create(patientData);
        setAssignedPatientId(generatedId);
        setShowSuccessModal(true);
        setSuccess("Patient registered successfully!");
      } else if (editingPatient) {
        await patientsApi.update(editingPatient.id, formData);
        setSuccess("Patient updated successfully");
      } else {
        await patientsApi.create(formData);
        setAssignedPatientId(formData.patient_id);
        setShowSuccessModal(true);
        setSuccess("Patient registered successfully!");
      }

      fetchPatients();
      resetForm();
      setShowVerificationModal(false);
    } catch (err) {
      setError("Failed to save patient");
    }
  };

  const handleView = (patient: Patient) => {
    setViewingPatient(patient);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      date_of_birth: "",
      phone_number: "",
      email: "",
      patient_id: "",
      national_id: "",
      passport_number: "",
      id_type: "national_id",
    });
    setEditingPatient(null);
    setShowForm(false);
    setError("");
    setSuccess("");
    setAssignedPatientId("");
    setShowSuccessModal(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-patient-management">
      <div className="admin-header">
        <h2>Patient Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Add New Patient
        </button>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <h3>Search Patients</h3>
        <div className="search-controls">
          <div className="search-type-selector">
            <label htmlFor="search-type-select">Search by:</label>
            <select
              id="search-type-select"
              value={searchType}
              onChange={(e) => handleSearchTypeChange(e.target.value)}
              className="search-type-select"
            >
              <option value="patient_id">Patient ID</option>
              <option value="national_id">National ID</option>
              <option value="passport_number">Passport Number</option>
            </select>
          </div>
          <div className="search-input-wrapper">
            <label htmlFor="search-input">Search Term</label>
            <input
              id="search-input"
              type="text"
              placeholder={`Enter ${searchType
                .replace("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}...`}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="search-clear-btn"
                onClick={() => handleSearch("")}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Debug display */}
      {showSMSModal && <div className="debug-sms-modal">SMS Modal Active</div>}

      {showForm && !showVerificationModal && !showSMSModal && (
        <div className="patient-form">
          <h3>{editingPatient ? "Edit Patient" : "Add New Patient"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first-name">First Name *</label>
                <input
                  id="first-name"
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="last-name">Last Name *</label>
                <input
                  id="last-name"
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date-of-birth">Date of Birth</label>
                <input
                  id="date-of-birth"
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone-number">Phone Number *</label>
                <input
                  id="phone-number"
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="patient@example.com"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="patient-id">
                  Patient ID (Optional - Leave blank to auto-generate)
                </label>
                <input
                  id="patient-id"
                  type="text"
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleInputChange}
                  placeholder="e.g., P001234 or leave blank"
                />
              </div>
              <div className="form-group">
                <label htmlFor="id-type">ID Type *</label>
                <select
                  id="id-type"
                  name="id_type"
                  value={formData.id_type}
                  onChange={handleSelectChange}
                  required
                >
                  <option value="national_id">National ID</option>
                  <option value="passport_number">Passport Number</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="identification-number">
                {formData.id_type === "national_id"
                  ? "National ID *"
                  : "Passport Number *"}
              </label>
              <input
                id="identification-number"
                type="text"
                name={formData.id_type}
                value={
                  formData.id_type === "national_id"
                    ? formData.national_id
                    : formData.passport_number
                }
                onChange={handleInputChange}
                placeholder={
                  formData.id_type === "national_id"
                    ? "e.g., 1234567890123"
                    : "e.g., A1234567"
                }
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Verify & Save Patient
                {editingPatient ? "Update Patient" : "Create Patient"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showVerificationModal && (
        <div className="verification-modal">
          <div className="modal-content">
            <h3>Patient Consent Verification</h3>
            <p>
              A 6-digit verification code has been sent to:{" "}
              <strong>{patientPhone}</strong>
            </p>
            <p>
              Please ask the patient to provide this code to confirm they
              consent to having their records created/modified.
            </p>

            <form onSubmit={handleVerification}>
              <div className="form-group">
                <label htmlFor="verification-code">Verification Code</label>
                <input
                  id="verification-code"
                  type="text"
                  name="code"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Verify & Save Patient
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowVerificationModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="dev-note">
              <small>
                <strong>Development Note:</strong> Check console for the
                verification code. In production, this would be sent via SMS.
              </small>
            </div>
          </div>
        </div>
      )}

      <div className="patients-list">
        <h3>Patient Records</h3>
        {filteredPatients.length === 0 ? (
          <p>No patients found</p>
        ) : (
          <table className="patients-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Patient ID</th>
                <th>Date of Birth</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <div className="patient-name-cell">
                      {patient.first_name} {patient.last_name}
                    </div>
                  </td>
                  <td>{patient.patient_id || "N/A"}</td>
                  <td>
                    {patient.date_of_birth
                      ? new Date(patient.date_of_birth).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )
                      : "N/A"}
                  </td>
                  <td>
                    <span className="status-badge status-active">Active</span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="icon-btn icon-btn-view"
                        onClick={() => handleView(patient)}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showSMSModal && (
        <div className="verification-modal">
          <div className="modal-content">
            <h3>Verification Code Sent</h3>
            <p>
              A 6-digit verification code has been sent to:{" "}
              <strong>{patientPhone}</strong>
            </p>
            <div className="verification-code-display">
              <div className="code-label">Your verification code is:</div>
              <div className="code-value">{verificationCode}</div>
            </div>
            <p className="verification-expiry-note">
              This code will expire in 5 minutes. Please do not share this code.
            </p>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setShowSMSModal(false);
                  setShowVerificationModal(true);
                }}
              >
                Got it, I'll enter this code
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && viewingPatient && (
        <div
          className="verification-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowViewModal(false);
            }
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Patient Details</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>
            <div className="patient-details-modal">
              <div className="detail-row">
                <span className="detail-label">Full Name:</span>
                <span className="detail-value">
                  {viewingPatient.first_name} {viewingPatient.last_name}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Patient ID:</span>
                <span className="detail-value">
                  {viewingPatient.patient_id || "N/A"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date of Birth:</span>
                <span className="detail-value">
                  {viewingPatient.date_of_birth
                    ? new Date(viewingPatient.date_of_birth).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )
                    : "N/A"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone Number:</span>
                <span className="detail-value">
                  {viewingPatient.phone_number || "N/A"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">
                  {viewingPatient.email || "N/A"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">National ID:</span>
                <span className="detail-value">
                  {viewingPatient.national_id || "N/A"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Passport Number:</span>
                <span className="detail-value">
                  {viewingPatient.passport_number || "N/A"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value">
                  <span className="status-badge status-active">Active</span>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Created:</span>
                <span className="detail-value">
                  {new Date(viewingPatient.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient ID Assignment Success Modal */}
      {showSuccessModal && (
        <div
          className="verification-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSuccessModal(false);
            }
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Patient Registration Successful!</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowSuccessModal(false)}
              >
                ×
              </button>
            </div>
            <div className="patient-details-modal">
              <div className="success-message">
                <div className="success-icon">✓</div>
                <p>Patient has been successfully registered!</p>
              </div>
              <div className="detail-row highlight">
                <span className="detail-label">Assigned Patient ID:</span>
                <span className="detail-value patient-id-display">
                  {assignedPatientId}
                </span>
              </div>
              <div className="instruction-text">
                <p>
                  <strong>Important:</strong> Please save this Patient ID for
                  future reference.
                </p>
                <p>
                  The patient will need this ID for all future visits and
                  appointments.
                </p>
              </div>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowSuccessModal(false)}
              >
                Got it, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
