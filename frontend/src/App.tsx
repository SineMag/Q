import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PatientCheckIn from './pages/PatientCheckIn';
import PatientStatus from './pages/PatientStatus';
import QueueView from './pages/QueueView';
import Patients from './pages/Patients';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PatientLogin from './pages/auth/PatientLogin';
import PatientRegister from './pages/auth/PatientRegister'; 
import Landing from './pages/auth/Landing';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>

        {/* Auth routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/patient-login" element={<PatientLogin />} />
        <Route path="/patient-register" element={<PatientRegister />} /> 
        
        {/* App routes */}
        <Route
          path="/patients"
          element={
            <ProtectedRoute allowedRoles={['admin', 'patient']}>
              <Layout>
                <Patients />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/check-in"
          element={
            <ProtectedRoute allowedRoles={['admin', 'patient']}>
              <Layout>
                <PatientCheckIn />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/queue"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <QueueView />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/status/:patientId"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <PatientStatus />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
