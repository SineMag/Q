import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PatientCheckIn from './pages/PatientCheckIn';
import PatientStatus from './pages/PatientStatus';
import QueueView from './pages/QueueView';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/check-in" element={<PatientCheckIn />} />
          <Route path="/queue" element={<QueueView />} />
          <Route path="/status/:patientId" element={<PatientStatus />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

