import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import PatientDashboard from "./pages/PatientDashboard";
import PatientCheckIn from "./pages/PatientCheckIn";
import TrackVisit from "./pages/TrackVisit";
import PatientStatus from "./pages/PatientStatus";
import QueueView from "./pages/QueueView";
import Patients from "./pages/Patients";
import HealthcareCommunication from "./pages/HealthcareCommunication";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PatientLogin from "./pages/auth/PatientLogin";
import PatientRegister from "./pages/auth/PatientRegister";
import Landing from "./pages/auth/Landing";
import AdminPatientManagement from "./pages/AdminPatientManagement";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route
          path="/"
          element={
            <Layout>
              <Landing />
            </Layout>
          }
        />
        <Route
          path="/login"
          element={
            <Layout>
              <Login />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout>
              <Register />
            </Layout>
          }
        />
        <Route
          path="/patient-login"
          element={
            <Layout>
              <PatientLogin />
            </Layout>
          }
        />
        <Route
          path="/patient-register"
          element={
            <Layout>
              <PatientRegister />
            </Layout>
          }
        />

        {/* App routes */}
        <Route
          path="/patients"
          element={
            <ProtectedRoute allowedRoles={["admin", "patient"]}>
              <Layout>
                <Patients />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/patient-management"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <AdminPatientManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <Layout>
                <PatientDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/track-visit"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <Layout>
                <TrackVisit />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/check-in"
          element={
            <ProtectedRoute allowedRoles={["admin", "patient"]}>
              <Layout>
                <PatientCheckIn />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/queue"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <QueueView />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/healthcare-communication"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <HealthcareCommunication />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/status/:patientId"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
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
