import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaHeartbeat,
  FaClipboardCheck,
  FaClock,
  FaMapMarkerAlt,
  FaMobileAlt,
  FaShieldAlt,
  FaUserFriends,
  FaInfoCircle,
} from 'react-icons/fa';
import './Patients.css';

export default function Patients() {
  const [patientId, setPatientId] = useState('');
  const [statusError, setStatusError] = useState('');
  const navigate = useNavigate();

  const handleStatusLookup = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedId = patientId.trim();
    if (!normalizedId) {
      setStatusError('Enter your patient code to continue.');
      return;
    }

    const safeId = normalizedId.match(/^[a-zA-Z0-9-]+$/);
    if (!safeId) {
      setStatusError('Use only letters, numbers, or dashes in your code.');
      return;
    }

    setStatusError('');
    navigate(`/status/${encodeURIComponent(normalizedId)}`);
  };

  return (
    <div className="patients-page">
      <section className="patients-hero card">
        <div className="hero-text">
          <p className="hero-tag">
            <FaHeartbeat aria-hidden="true" /> Patient Experience Portal
          </p>
          <h1>Check in, stay informed, and feel confident about your visit</h1>
          <p>
            Q keeps patients updated from arrival to discharge. Save your spot, monitor your
            estimated wait, and know when it is your turn without needing access to the
            administrative dashboard.
          </p>
          <div className="hero-actions">
            <Link to="/check-in" className="btn btn-primary">
              <FaClipboardCheck aria-hidden="true" />
              Start Check-In
            </Link>
            <a href="#track-status" className="btn btn-secondary">
              <FaClock aria-hidden="true" />
              Track My Visit
            </a>
          </div>
        </div>
        <div className="hero-card">
          <FaShieldAlt aria-hidden="true" className="hero-card-icon" />
          <h3>Designed for patients</h3>
          <ul>
            <li>Secure check-in from any device</li>
            <li>Real-time updates without calling the desk</li>
            <li>Clear next steps after each status change</li>
          </ul>
        </div>
      </section>

      <section className="patients-quick-actions">
        <div className="action-card card">
          <FaClipboardCheck aria-hidden="true" className="action-icon" />
          <h3>Check in digitally</h3>
          <p>
            Answer triage questions before you arrive so the care team is ready when you walk in.
          </p>
          <Link to="/check-in" className="btn btn-primary">
            Begin Check-In
          </Link>
        </div>
        <div className="action-card card">
          <FaClock aria-hidden="true" className="action-icon" />
          <h3>Follow your wait time</h3>
          <p>Use your patient code to jump straight to the live status page at any time.</p>
          <form className="status-form" onSubmit={handleStatusLookup}>
            <label htmlFor="patient-id">Enter patient code</label>
            <input
              id="patient-id"
              className="input"
              placeholder="e.g. 12345"
              value={patientId}
              onChange={(event) => {
                setPatientId(event.target.value);
                if (statusError) setStatusError('');
              }}
            />
            {statusError && <p className="status-error">{statusError}</p>}
            <button type="submit" className="btn btn-secondary">
              View My Status
            </button>
          </form>
        </div>
        <div className="action-card card">
          <FaMapMarkerAlt aria-hidden="true" className="action-icon" />
          <h3>Know where to go</h3>
          <p>
            Receive arrival instructions and facility guidance as soon as your visit is confirmed.
          </p>
          <button type="button" className="btn btn-secondary" disabled>
            Coming Soon
          </button>
        </div>
      </section>

      <section id="track-status" className="patients-status card">
        <div className="status-header">
          <FaMobileAlt aria-hidden="true" className="status-icon" />
          <div>
            <p className="hero-tag">Stay in the loop</p>
            <h2>Track every step of your visit</h2>
          </div>
        </div>
        <div className="status-steps">
          {[
            {
              title: 'Check-In',
              description: 'Confirm your information and share the reason for your visit.',
            },
            {
              title: 'Waiting Room',
              description: 'Watch the real-time wait estimate adjust as the queue moves.',
            },
            {
              title: 'In Progress',
              description: 'Get notified when a clinician is assigned and you are being seen.',
            },
            {
              title: 'Visit Complete',
              description: 'See a quick summary of your total visit time and next steps.',
            },
          ].map((step, index) => (
            <div key={step.title} className="status-step">
              <div className="step-number">{index + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="patients-faq card">
        <div className="faq-header">
          <FaInfoCircle aria-hidden="true" />
          <h2>Helpful info for patients and families</h2>
        </div>
        <div className="faq-grid">
          <div>
            <h3>
              <FaUserFriends aria-hidden="true" /> Bring a support person
            </h3>
            <p>
              Share your status link so a family member can keep track without needing access to
              staff tools.
            </p>
          </div>
          <div>
            <h3>
              <FaShieldAlt aria-hidden="true" /> Your data stays private
            </h3>
            <p>
              Only you and authorized care teams can see your medical details. We just use your
              queue ID to look up status.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}


