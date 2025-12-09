import "./SuccessModal.css";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientInfo: {
    first_name: string;
    last_name: string;
    id: number;
    triage_level: string;
    estimated_wait: string;
    phone_number?: string;
  };
}

export default function SuccessModal({
  isOpen,
  onClose,
  patientInfo,
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="success-modal">
        <div className="modal-header">
          <div className="success-icon">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="var(--color-success)"
                fillOpacity="0.2"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="var(--color-success)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h2>Check-In Successful!</h2>
        </div>

        <div className="modal-content">
          <div className="patient-summary">
            <h3>Patient Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Name:</label>
                <span>
                  {patientInfo.first_name} {patientInfo.last_name}
                </span>
              </div>
              <div className="info-item">
                <label>Patient ID:</label>
                <span className="patient-id">{patientInfo.id}</span>
              </div>
              <div className="info-item">
                <label>Triage Level:</label>
                <span
                  className={`triage-level triage-${patientInfo.triage_level}`}
                >
                  {patientInfo.triage_level.replace("_", " ").toUpperCase()}
                </span>
              </div>
              <div className="info-item">
                <label>Estimated Wait:</label>
                <span>{patientInfo.estimated_wait} minutes</span>
              </div>
            </div>
          </div>

          <div className="notification-info">
            <div className="notification-item">
              <div className="notification-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="notification-text">
                <strong>SMS Notification Sent</strong>
                <p>
                  Confirmation sent to{" "}
                  {patientInfo.phone_number || "your phone number"}
                </p>
              </div>
            </div>
          </div>

          <div className="next-steps">
            <h4>What's Next?</h4>
            <ul>
              <li>You'll receive SMS updates about your queue position</li>
              <li>Staff will call you when it's your turn</li>
              <li>You can check your status anytime using your Patient ID</li>
            </ul>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-primary">
            View My Status
          </button>
        </div>
      </div>
    </div>
  );
}
