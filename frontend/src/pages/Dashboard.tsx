import { useEffect, useState } from 'react';
import { queueApi } from '../services/api';
import './Dashboard.css';

interface QueueStats {
  waiting_count: string;
  in_progress_count: string;
  completed_count: string;
  avg_wait_time: string;
  immediate_count: string;
  urgent_count: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const response = await queueApi.getStats();
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p className="dashboard-subtitle">Real-time queue overview</p>

      <div className="stats-grid">
        <div className="stat-card stat-waiting">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.waiting_count || '0'}</div>
            <div className="stat-label">Waiting</div>
          </div>
        </div>

        <div className="stat-card stat-progress">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.in_progress_count || '0'}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        <div className="stat-card stat-completed">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.completed_count || '0'}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <div className="stat-card stat-wait-time">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">
              {stats?.avg_wait_time 
                ? `${Math.round(parseFloat(stats.avg_wait_time))} min`
                : 'N/A'}
            </div>
            <div className="stat-label">Avg Wait Time</div>
          </div>
        </div>

        <div className="stat-card stat-immediate">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.immediate_count || '0'}</div>
            <div className="stat-label">Immediate</div>
          </div>
        </div>

        <div className="stat-card stat-urgent">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.urgent_count || '0'}</div>
            <div className="stat-label">Urgent</div>
          </div>
        </div>
      </div>

      <div className="dashboard-info">
        <div className="info-card">
          <h3>Welcome to Q</h3>
          <p>
            This dashboard provides real-time insights into your healthcare queue. 
            Monitor patient flow, wait times, and triage levels at a glance.
          </p>
        </div>
      </div>
    </div>
  );
}

