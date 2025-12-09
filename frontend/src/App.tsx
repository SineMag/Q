import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PatientCheckIn from './pages/PatientCheckIn';
import PatientStatus from './pages/PatientStatus';
import QueueView from './pages/QueueView';
import Patients from './pages/Patients';
import Login from './pages/auth/Login';
import PatientLogin from './pages/auth/PatientLogin';
import Landing from './pages/auth/Landing';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/admin-login" element={<Login />} />
        <Route path="/patient-login" element={<PatientLogin />} />

        {/* App routes with Layout */}
        <Route
          path="/patients"
          element={<Layout><Patients /></Layout>}
        />
        <Route
          path="/dashboard"
          element={<Layout><Dashboard /></Layout>}
        />
        <Route
          path="/check-in"
          element={<Layout><PatientCheckIn /></Layout>}
        />
        <Route
          path="/queue"
          element={<Layout><QueueView /></Layout>}
        />
        <Route
          path="/status/:patientId"
          element={<Layout><PatientStatus /></Layout>}
        />
      </Routes>
    </Router>
  );
}

export default App;
