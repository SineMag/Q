import { useEffect, useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { queueApi, staffApi } from '../services/api';
import './QueueView.css';

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
  priority_score: number;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  staff_name: string | null;
  staff_role: string | null;
}

interface Staff {
  id: number;
  name: string;
  role: string;
  is_available: boolean;
}

export default function QueueView() {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadData = async () => {
    try {
      const [queueRes, staffRes] = await Promise.all([
        queueApi.getAll(filter !== 'all' ? filter : undefined),
        staffApi.getAll(),
      ]);
      setQueue(queueRes.data);
      setStaff(staffRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleAssignStaff = async (queueId: number, staffId: number) => {
    try {
      await queueApi.update(queueId, { staff_id: staffId, status: 'in_progress' });
      loadData();
    } catch (error) {
      console.error('Error assigning staff:', error);
    }
  };

  const handleComplete = async (queueId: number) => {
    try {
      await queueApi.complete(queueId);
      loadData();
    } catch (error) {
      console.error('Error completing queue entry:', error);
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
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return <div className="loading">Loading queue...</div>;
  }

  return (
    <div className="queue-view">
      <div className="queue-header">
        <h1>Queue Management</h1>
        <div className="queue-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'waiting' ? 'active' : ''}`}
            onClick={() => setFilter('waiting')}
          >
            Waiting
          </button>
          <button
            className={`filter-btn ${filter === 'in_progress' ? 'active' : ''}`}
            onClick={() => setFilter('in_progress')}
          >
            In Progress
          </button>
        </div>
      </div>

      <div className="queue-stats-bar">
        <div className="stat-item">
          <span className="stat-label">Total:</span>
          <span className="stat-value">{queue.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Waiting:</span>
          <span className="stat-value">
            {queue.filter((q) => q.status === 'waiting').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">In Progress:</span>
          <span className="stat-value">
            {queue.filter((q) => q.status === 'in_progress').length}
          </span>
        </div>
      </div>

      <div className="queue-list">
        {queue.length === 0 ? (
          <div className="empty-queue">
            <p>No patients in queue</p>
          </div>
        ) : (
          queue.map((entry) => (
            <div key={entry.id} className="queue-card">
              <div className="queue-card-header">
                <div className="patient-info">
                  <h3>
                    {entry.first_name} {entry.last_name}
                  </h3>
                  <div className="badges">
                    <span className={getTriageBadgeClass(entry.triage_level)}>
                      {entry.triage_level.replace('_', ' ')}
                    </span>
                    <span className={getStatusBadgeClass(entry.status)}>
                      {entry.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="priority-score">
                  Priority: {entry.priority_score}
                </div>
              </div>

              <div className="queue-card-body">
                <div className="queue-details">
                  <div className="detail-item">
                    <span className="detail-label">Check-in:</span>
                    <span className="detail-value">
                      {new Date(entry.check_in_time).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Est. Wait:</span>
                    <span className="detail-value">
                      {formatTime(entry.estimated_wait_minutes)}
                    </span>
                  </div>
                  {entry.actual_wait_minutes && (
                    <div className="detail-item">
                      <span className="detail-label">Actual Wait:</span>
                      <span className="detail-value">
                        {formatTime(entry.actual_wait_minutes)}
                      </span>
                    </div>
                  )}
                  {entry.phone_number && (
                    <div className="detail-item">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{entry.phone_number}</span>
                    </div>
                  )}
                </div>

                {entry.notes && (
                  <div className="queue-notes">
                    <strong>Notes:</strong> {entry.notes}
                  </div>
                )}

                {entry.staff_name ? (
                  <div className="assigned-staff">
                    <strong>Assigned to:</strong> {entry.staff_name} ({entry.staff_role})
                  </div>
                ) : (
                  <div className="assign-staff">
                    <div className="assign-staff-header">
                      <label htmlFor={`staff-${entry.id}`}>Assign Staff:</label>
                      <span className="availability-hint">
                        <FaCheckCircle aria-hidden="true" /> Available
                      </span>
                    </div>
                    <select
                      id={`staff-${entry.id}`}
                      className="select"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAssignStaff(entry.id, parseInt(e.target.value));
                        }
                      }}
                      value=""
                    >
                      <option value="">Select staff member...</option>
                      {staff
                        .filter((s) => s.is_available || s.id === entry.staff_id)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                              {`${s.name} (${s.role})${s.is_available ? ' - Available' : ''}`}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {entry.status === 'in_progress' && (
                  <button
                    className="btn btn-success"
                    onClick={() => handleComplete(entry.id)}
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

