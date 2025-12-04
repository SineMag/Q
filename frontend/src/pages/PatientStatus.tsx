import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { queueApi, patientsApi } from '../services/api';
import './PatientStatus.css';

interface QueueEntry {
  id: number;
  patient_id: number;
  staff_id: number | null;
  triage_level: string;
  status: string;
  check_in_time: string;
  estimated_wait_minutes: number;
  actual_wait_minutes: number | null;
  notes: string | null;
  staff_name: string | null;
  staff_role: string | null;
}

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  email: string | null;
}

export default function PatientStatus() {
  const { patientId } = useParams<{ patientId: string }>();
  const [queueEntry, setQueueEntry] = useState<QueueEntry | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patientId) {
      loadData();
      const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [patientId]);

  const loadData = async () => {
    if (!patientId) return;

    try {
      const [queueRes, patientRes] = await Promise.all([
        queueApi.getPatientStatus(parseInt(patientId)),
        patientsApi.getById(parseInt(patientId)),
      ]);
      setQueueEntry(queueRes.data);
      setPatient(patientRes.data);
      setLoading(false);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('No active queue entry found for this patient.');
      } else {
        setError('Failed to load patient status.');
      }
      setLoading(false);
    }
  };

  const getTriageBadgeClass = (level: string) => {
    return `badge badge-${level.replace('_', '-')}`;
  };

  const getStatusBadgeClass = (status: string) => {
    return `badge badge-${status.replace('_', '-')}`;
  };

  const formatTime = (minutes: number | null) => {
    if (minutes === null) return 'N/A';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
  };

  const calculateWaitTime = () => {
    if (!queueEntry) return null;
    if (queueEntry.status !== 'waiting') return null;

    const checkInTime = new Date(queueEntry.check_in_time);
    const now = new Date();
    const elapsedMinutes = Math.floor((now.getTime() - checkInTime.getTime()) / 60000);
    const remainingMinutes = Math.max(0, queueEntry.estimated_wait_minutes - elapsedMinutes);

    return {
      elapsed: elapsedMinutes,
      remaining: remainingMinutes,
    };
  };

  if (loading) {
    return (
      <div className="patient-status">
        <div className="loading">Loading patient status...</div>
      </div>
    );
  }

  if (error || !queueEntry || !patient) {
    return (
      <div className="patient-status">
        <div className="error-state">
          <h2>Status Not Available</h2>
          <p>{error || 'Unable to load patient status.'}</p>
        </div>
      </div>
    );
  }

  const waitTime = calculateWaitTime();

  return (
    <div className="patient-status">
      <div className="status-header">
        <h1>Your Queue Status</h1>
        <p className="patient-name">
          {patient.first_name} {patient.last_name}
        </p>
      </div>

      <div className="status-card">
        <div className="status-badges">
          <span className={getTriageBadgeClass(queueEntry.triage_level)}>
            {queueEntry.triage_level.replace('_', ' ')}
          </span>
          <span className={getStatusBadgeClass(queueEntry.status)}>
            {queueEntry.status.replace('_', ' ')}
          </span>
        </div>

        {queueEntry.status === 'waiting' && waitTime && (
          <div className="wait-time-display">
            <div className="wait-time-main">
              <div className="wait-time-value">{waitTime.remaining}</div>
              <div className="wait-time-label">minutes remaining</div>
            </div>
            <div className="wait-time-details">
              <p>You've been waiting for {waitTime.elapsed} minutes</p>
              <p>Estimated total wait: {formatTime(queueEntry.estimated_wait_minutes)}</p>
            </div>
          </div>
        )}

        {queueEntry.status === 'in_progress' && queueEntry.staff_name && (
          <div className="in-progress-info">
            <h3>You're being seen now!</h3>
            <p>
              <strong>{queueEntry.staff_name}</strong> ({queueEntry.staff_role}) is currently
              providing your care.
            </p>
            {queueEntry.actual_wait_minutes && (
              <p className="wait-summary">
                Your total wait time was {formatTime(queueEntry.actual_wait_minutes)}.
              </p>
            )}
          </div>
        )}

        {queueEntry.status === 'completed' && (
          <div className="completed-info">
            <h3>✓ Visit Completed</h3>
            <p>Thank you for your visit. We hope you're feeling better!</p>
            {queueEntry.actual_wait_minutes && (
              <p className="wait-summary">
                Your total wait time was {formatTime(queueEntry.actual_wait_minutes)}.
              </p>
            )}
          </div>
        )}

        <div className="status-details">
          <div className="detail-row">
            <span className="detail-label">Check-in Time:</span>
            <span className="detail-value">
              {new Date(queueEntry.check_in_time).toLocaleString()}
            </span>
          </div>
          {queueEntry.staff_name && (
            <div className="detail-row">
              <span className="detail-label">Provider:</span>
              <span className="detail-value">
                {queueEntry.staff_name} ({queueEntry.staff_role})
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="status-info">
        <p>
          This page updates automatically. You can bookmark it to check your status at any time.
        </p>
      </div>
    </div>
  );
}

