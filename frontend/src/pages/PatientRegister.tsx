import { useState } from "react";
import {
  FaUser,
  FaCalendarAlt,
  FaIdCard,
  FaHospital,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaSave,
} from "react-icons/fa";
import { patientsApi } from "../services/api";
import "./PatientRegister.css";

interface PatientFormData {
  name: string;
  date_of_birth: string;
  id_passport: string;
  age: number;
  phone: string;
  email: string;
  address: string;
  department: string;
  triage_level: "immediate" | "urgent" | "delayed" | "minor";
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_history: string;
  allergies: string;
  current_medications: string;
}

const departments = [
  "Emergency",
  "General",
  "Surgery",
  "Pediatrics",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Oncology",
  "Maternity",
  "Radiology",
];

const triageLevels = [
  {
    value: "immediate",
    label: "Immediate - Life-threatening",
    color: "#dc2626",
  },
  { value: "urgent", label: "Urgent - Serious but stable", color: "#ea580c" },
  {
    value: "delayed",
    label: "Delayed - Minor but needs treatment",
    color: "#ca8a04",
  },
  { value: "minor", label: "Minor - Non-urgent", color: "#16a34a" },
];

export default function PatientRegister() {
  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    date_of_birth: "",
    id_passport: "",
    age: 0,
    phone: "",
    email: "",
    address: "",
    department: "Emergency",
    triage_level: "delayed",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    medical_history: "",
    allergies: "",
    current_medications: "",
  });

  const [errors, setErrors] = useState<Partial<PatientFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "date_of_birth") {
      const age = calculateAge(value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        age: age,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field
    if (errors[name as keyof PatientFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PatientFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Patient name is required";
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
    } else {
      const age = calculateAge(formData.date_of_birth);
      if (age < 0 || age > 150) {
        newErrors.date_of_birth = "Please enter a valid date of birth";
      }
    }

    if (!formData.id_passport.trim()) {
      newErrors.id_passport = "ID/Passport number is required";
    } else if (formData.id_passport.length < 5) {
      newErrors.id_passport =
        "ID/Passport number must be at least 5 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.emergency_contact_name.trim()) {
      newErrors.emergency_contact_name = "Emergency contact name is required";
    }

    if (!formData.emergency_contact_phone.trim()) {
      newErrors.emergency_contact_phone = "Emergency contact phone is required";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.emergency_contact_phone)) {
      newErrors.emergency_contact_phone =
        "Please enter a valid emergency contact phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const patientData = {
        ...formData,
        check_in_time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "waiting" as const,
        wait_time: 0,
      };

      const response = await patientsApi.create(patientData);

      if (response.data) {
        setSubmitSuccess(true);
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            name: "",
            date_of_birth: "",
            id_passport: "",
            age: 0,
            phone: "",
            email: "",
            address: "",
            department: "Emergency",
            triage_level: "delayed",
            emergency_contact_name: "",
            emergency_contact_phone: "",
            medical_history: "",
            allergies: "",
            current_medications: "",
          });
          setSubmitSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error registering patient:", error);
      // Show error message (you could add a toast/notification here)
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTriageClass = (level: string) => {
    return `triage-${level}`;
  };

  return (
    <div className="patient-register">
      <div className="register-header">
        <button className="back-btn" onClick={() => window.history.back()}>
          <FaArrowLeft /> Back to Dashboard
        </button>
        <h1>
          <FaUser /> Patient Registration
        </h1>
        <p>Please fill in all required fields marked with *</p>
      </div>

      {submitSuccess && (
        <div className="success-message">
          <FaSave /> Patient registered successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="register-form">
        {/* Personal Information Section */}
        <div className="form-section">
          <h2>
            <FaUser /> Personal Information
          </h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? "error" : ""}
                placeholder="Enter patient's full name"
                required
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="date_of_birth">
                <FaCalendarAlt /> Date of Birth *
              </label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className={errors.date_of_birth ? "error" : ""}
                max={new Date().toISOString().split("T")[0]}
                required
              />
              {errors.date_of_birth && (
                <span className="error-message">{errors.date_of_birth}</span>
              )}
              {formData.age > 0 && (
                <span className="age-display">
                  Calculated Age: {formData.age} years
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="id_passport">
                <FaIdCard /> ID/Passport Number *
              </label>
              <input
                type="text"
                id="id_passport"
                name="id_passport"
                value={formData.id_passport}
                onChange={handleInputChange}
                className={errors.id_passport ? "error" : ""}
                placeholder="Enter ID or Passport number"
                required
              />
              {errors.id_passport && (
                <span className="error-message">{errors.id_passport}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                <FaPhoneAlt /> Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? "error" : ""}
                placeholder="+1 (555) 123-4567"
                required
              />
              {errors.phone && (
                <span className="error-message">{errors.phone}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <FaEnvelope /> Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? "error" : ""}
                placeholder="patient@example.com"
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="address">
                <FaMapMarkerAlt /> Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter full address"
              />
            </div>
          </div>
        </div>

        {/* Medical Information Section */}
        <div className="form-section">
          <h2>
            <FaHospital /> Medical Information
          </h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="triage_level">Triage Level *</label>
              <select
                id="triage_level"
                name="triage_level"
                value={formData.triage_level}
                onChange={handleInputChange}
                className={getTriageClass(formData.triage_level)}
                required
              >
                {triageLevels.map((triage) => (
                  <option key={triage.value} value={triage.value}>
                    {triage.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="medical_history">Medical History</label>
              <textarea
                id="medical_history"
                name="medical_history"
                value={formData.medical_history}
                onChange={handleInputChange}
                placeholder="Enter any relevant medical history..."
                rows={3}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="allergies">Allergies</label>
              <textarea
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                placeholder="List any known allergies..."
                rows={2}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="current_medications">Current Medications</label>
              <textarea
                id="current_medications"
                name="current_medications"
                value={formData.current_medications}
                onChange={handleInputChange}
                placeholder="List current medications and dosages..."
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact Section */}
        <div className="form-section">
          <h2>
            <FaPhoneAlt /> Emergency Contact
          </h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="emergency_contact_name">Contact Name *</label>
              <input
                type="text"
                id="emergency_contact_name"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleInputChange}
                className={errors.emergency_contact_name ? "error" : ""}
                placeholder="Emergency contact full name"
                required
              />
              {errors.emergency_contact_name && (
                <span className="error-message">
                  {errors.emergency_contact_name}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="emergency_contact_phone">Contact Phone *</label>
              <input
                type="tel"
                id="emergency_contact_phone"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleInputChange}
                className={errors.emergency_contact_phone ? "error" : ""}
                placeholder="+1 (555) 987-6543"
                required
              />
              {errors.emergency_contact_phone && (
                <span className="error-message">
                  {errors.emergency_contact_phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="form-section submit-section">
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            <FaSave />
            {isSubmitting ? "Registering Patient..." : "Register Patient"}
          </button>
        </div>
      </form>
    </div>
  );
}
