import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { patientsApi, queueApi, aiApi } from "../services/api";
import SuccessModal from "../components/SuccessModal";
import Snackbar from "../components/Snackbar";
import AITranslator from "../components/AITranslator";
import "./PatientCheckIn.css";

const TRIAGE_LEVELS = [
  {
    value: "immediate",
    label: "Immediate",
    description: "Life-threatening condition",
  },
  {
    value: "urgent",
    label: "Urgent",
    description: "Requires prompt attention",
  },
  {
    value: "semi_urgent",
    label: "Semi-Urgent",
    description: "Can wait but needs care today",
  },
  { value: "non_urgent", label: "Non-Urgent", description: "Routine care" },
];

export default function PatientCheckIn() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [patientInfo, setPatientInfo] = useState<any>(null);

  const [patientData, setPatientData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    phone_number: "",
    email: "",
  });

  const [queueData, setQueueData] = useState({
    triage_level: "non_urgent",
    notes: "",
  });

  const [showAITranslator, setShowAITranslator] = useState(false);
  const [translatedNotes, setTranslatedNotes] = useState("");
  const [aiExplanation, setAiExplanation] = useState("");

  useEffect(() => {
    // Check if patient is already logged in
    const patientData =
      localStorage.getItem("patientData") ||
      localStorage.getItem("patientInfo");
    if (patientData) {
      const patient = JSON.parse(patientData);
      setPatientData({
        first_name: patient.full_name?.split(" ")[0] || "",
        last_name: patient.full_name?.split(" ")[1] || "",
        date_of_birth: "",
        phone_number: patient.phone_number || "",
        email: patient.email || "",
      });
      // Skip to step 2 since patient already exists
      setStep(2);
      (window as any).tempPatientId = patient.id;
    }
  }, []);

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await patientsApi.create(patientData);
      const patientId = response.data.id;

      setStep(2);
      (window as any).tempPatientId = patientId;
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create patient record");
    } finally {
      setLoading(false);
    }
  };

  const handleQueueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const patientId = (window as any).tempPatientId;

      let enhancedNotes = queueData.notes;
      if (queueData.notes && translatedNotes) {
        enhancedNotes = `${queueData.notes}\n\n[AI Translation]: ${translatedNotes}`;
      }

      const response = await queueApi.checkIn({
        patient_id: patientId,
        triage_level: queueData.triage_level,
        notes: enhancedNotes,
      });

      // Generate AI explanation for patient
      if (queueData.notes) {
        try {
          const explanationResponse = await aiApi.generateExplanation(
            queueData.triage_level,
            "Initial assessment and triage",
            "Wait for medical evaluation and follow triage protocol"
          );
          setAiExplanation(explanationResponse.explanation);
        } catch (error) {
          console.log(
            "AI explanation generation failed, continuing without it"
          );
        }
      }

      // Store patient info for modal
      setPatientInfo({
        ...patientData,
        id: patientId,
        triage_level: queueData.triage_level,
        estimated_wait: response.data.estimated_wait_minutes || "15-20",
        ai_explanation: aiExplanation,
      });

      // Send SMS notification (in production, this would be a real SMS service)
      if (patientData.phone_number) {
        await sendSMSNotification(
          patientData.phone_number,
          patientId,
          queueData.triage_level
        );
      }

      // Show success modal and snackbar
      setShowSuccessModal(true);
      setShowSnackbar(true);

      // Hide snackbar after 5 seconds
      setTimeout(() => setShowSnackbar(false), 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to check in patient");
    } finally {
      setLoading(false);
    }
  };

  const sendSMSNotification = async (
    phoneNumber: string,
    patientId: number,
    triageLevel: string
  ) => {
    // In production, this would call a real SMS service like Twilio
    const message = `Q Healthcare: You have successfully checked in! Patient ID: ${patientId}. Triage Level: ${triageLevel}. Estimated wait time: 15-20 minutes. We'll notify you when it's your turn. Reply STATUS to get updates.`;

    console.log(`SMS sent to ${phoneNumber}: ${message}`);

    // For development, show the SMS in console
    // In production, you would make an API call to your SMS service
    try {
      // Example: await smsApi.send({ to: phoneNumber, message });
    } catch (error) {
      console.error("Failed to send SMS:", error);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate(`/status/${patientInfo?.id}`);
  };

  const handleTranslation = (translatedText: string) => {
    setTranslatedNotes(translatedText);
    setShowAITranslator(false);
  };

  return (
    <div className="check-in">
      <h1>Patient Check-In</h1>
      <p className="check-in-subtitle">Register and join the queue</p>

      <div className="check-in-steps">
        <div
          className={`step ${step >= 1 ? "active" : ""} ${
            step > 1 ? "completed" : ""
          }`}
        >
          <div className="step-number">1</div>
          <div className="step-label">Patient Information</div>
        </div>
        <div className={`step ${step >= 2 ? "active" : ""}`}>
          <div className="step-number">2</div>
          <div className="step-label">Triage & Check-In</div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {step === 1 && (
        <form onSubmit={handlePatientSubmit} className="check-in-form">
          <div className="form-group">
            <label htmlFor="first_name">First Name *</label>
            <input
              type="text"
              id="first_name"
              className="input"
              required
              value={patientData.first_name}
              onChange={(e) =>
                setPatientData({ ...patientData, first_name: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Last Name *</label>
            <input
              type="text"
              id="last_name"
              className="input"
              required
              value={patientData.last_name}
              onChange={(e) =>
                setPatientData({ ...patientData, last_name: e.target.value })
              }
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date_of_birth">Date of Birth</label>
              <input
                type="date"
                id="date_of_birth"
                className="input"
                value={patientData.date_of_birth}
                onChange={(e) =>
                  setPatientData({
                    ...patientData,
                    date_of_birth: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone_number">Phone Number</label>
              <input
                type="tel"
                id="phone_number"
                className="input"
                value={patientData.phone_number}
                onChange={(e) =>
                  setPatientData({
                    ...patientData,
                    phone_number: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="input"
              value={patientData.email}
              onChange={(e) =>
                setPatientData({ ...patientData, email: e.target.value })
              }
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Processing..." : "Continue to Triage"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleQueueSubmit} className="check-in-form">
          <div className="form-group">
            <label htmlFor="triage_level">Triage Level *</label>
            <select
              id="triage_level"
              className="select"
              required
              value={queueData.triage_level}
              onChange={(e) =>
                setQueueData({ ...queueData, triage_level: e.target.value })
              }
            >
              {TRIAGE_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label} - {level.description}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              className="input"
              rows={4}
              value={queueData.notes}
              onChange={(e) =>
                setQueueData({ ...queueData, notes: e.target.value })
              }
              placeholder="Any additional information about the patient's condition..."
            />
            {queueData.notes && (
              <button
                type="button"
                className="btn btn-secondary ai-translate-btn"
                onClick={() => setShowAITranslator(true)}
              >
                🤖 Translate with AI
              </button>
            )}
            {translatedNotes && (
              <div className="ai-translation-preview">
                <strong>AI Translation:</strong> {translatedNotes}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Back
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Checking In..." : "Complete Check-In"}
            </button>
          </div>
        </form>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        patientInfo={patientInfo}
      />

      {/* AI Translator Modal */}
      {showAITranslator && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>AI Medical Translator</h3>
              <button
                className="modal-close"
                onClick={() => setShowAITranslator(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <AITranslator onTranslation={handleTranslation} />
            </div>
          </div>
        </div>
      )}

      {/* Success Snackbar */}
      <Snackbar
        isOpen={showSnackbar}
        message="Check-in successful! You'll receive SMS updates."
        type="success"
      />
    </div>
  );
}
