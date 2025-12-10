import { useEffect, useState } from "react";
import {
  FaHourglassHalf,
  FaUserMd,
  FaCheckCircle,
  FaStopwatch,
  FaAmbulance,
  FaExclamationTriangle,
  FaUsers,
  FaChartLine,
  FaCalendarAlt,
  FaBell,
  FaCog,
  FaDownload,
  FaPlus,
  FaSearch,
  FaSync,
  FaPhoneAlt,
  FaClipboardList,
  FaFileMedical,
  FaClock,
  FaTachometerAlt,
  FaChartBar,
  FaChartPie,
  FaChartArea,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaEye,
  FaEdit,
  FaTimes,
  FaBolt,
  FaHospital,
  FaFilter,
  FaExpand,
  FaCompress,
  FaPrint,
  FaEnvelope,
  FaVideo,
  FaUserPlus,
  FaNotesMedical,
  FaClipboard,
} from "react-icons/fa";
import { queueApi, patientsApi } from "../services/api";
import "./Dashboard.css";

interface QueueStats {
  waiting_count: string;
  in_progress_count: string;
  completed_count: string;
  avg_wait_time: string;
  immediate_count: string;
  urgent_count: string;
}

interface Staff {
  id: number;
  name: string;
  role: string;
  department: string;
  status: "available" | "busy" | "off-duty";
  patients_assigned: number;
  efficiency: number;
}

interface Patient {
  id: number;
  name: string;
  age: number;
  date_of_birth: string;
  id_passport: string;
  triage_level: "immediate" | "urgent" | "delayed" | "minor";
  wait_time: number;
  assigned_staff?: string;
  department: string;
  check_in_time: string;
  status: "waiting" | "in-progress" | "completed";
}

interface Department {
  name: string;
  current_load: number;
  capacity: number;
  avg_wait_time: number;
  staff_on_duty: number;
  efficiency: number;
}

interface Alert {
  id: number;
  type: "critical" | "warning" | "info";
  message: string;
  time: string;
  acknowledged: boolean;
}

export default function Dashboard() {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<
    "overview" | "patients" | "staff" | "analytics"
  >("overview");
  const [staff, setStaff] = useState<Staff[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">(
    "today"
  );
  const [sortBy, setSortBy] = useState<"name" | "status" | "wait-time">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedPatients, setSelectedPatients] = useState<number[]>([]);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(10);
  const [hasManualPatients, setHasManualPatients] = useState(false);

  useEffect(() => {
    loadDashboardData();
    let interval: ReturnType<typeof setInterval>;
    if (autoRefresh && !hasManualPatients) {
      interval = setInterval(loadDashboardData, refreshInterval * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRange, autoRefresh, refreshInterval, hasManualPatients]);

  const loadDashboardData = async () => {
    try {
      const [statsResponse] = await Promise.all([queueApi.getStats()]);

      setStats(statsResponse.data);

      // Load patients separately to handle errors properly
      try {
        const patientsResponse = await patientsApi.getAll();
        if (patientsResponse.data && patientsResponse.data.length > 0) {
          setPatients(patientsResponse.data);
          console.log("Loaded patients from API:", patientsResponse.data);
        } else {
          console.log("No patients from API, using fallback data");
          // Set fallback patients if API returns empty
          setPatients([
            {
              id: 1,
              name: "John Smith",
              age: 45,
              date_of_birth: "1979-03-15",
              id_passport: "ID123456789",
              triage_level: "immediate",
              wait_time: 5,
              assigned_staff: "Dr. Sarah Johnson",
              department: "Emergency",
              check_in_time: "09:15",
              status: "in-progress",
            },
            {
              id: 2,
              name: "Maria Garcia",
              age: 32,
              date_of_birth: "1992-07-22",
              id_passport: "P987654321",
              triage_level: "urgent",
              wait_time: 15,
              assigned_staff: "Dr. Michael Chen",
              department: "General",
              check_in_time: "09:30",
              status: "waiting",
            },
            {
              id: 3,
              name: "Robert Johnson",
              age: 67,
              date_of_birth: "1957-11-08",
              id_passport: "ID456789123",
              triage_level: "immediate",
              wait_time: 8,
              assigned_staff: "Dr. Sarah Johnson",
              department: "Emergency",
              check_in_time: "09:45",
              status: "in-progress",
            },
          ]);
        }
      } catch (patientError) {
        console.error("Error loading patients from API:", patientError);
        // Set fallback patients on API error
        setPatients([
          {
            id: 1,
            name: "John Smith",
            age: 45,
            date_of_birth: "1979-03-15",
            id_passport: "ID123456789",
            triage_level: "immediate",
            wait_time: 5,
            assigned_staff: "Dr. Sarah Johnson",
            department: "Emergency",
            check_in_time: "09:15",
            status: "in-progress",
          },
          {
            id: 2,
            name: "Maria Garcia",
            age: 32,
            date_of_birth: "1992-07-22",
            id_passport: "P987654321",
            triage_level: "urgent",
            wait_time: 15,
            assigned_staff: "Dr. Michael Chen",
            department: "General",
            check_in_time: "09:30",
            status: "waiting",
          },
          {
            id: 3,
            name: "Robert Johnson",
            age: 67,
            date_of_birth: "1957-11-08",
            id_passport: "ID456789123",
            triage_level: "immediate",
            wait_time: 8,
            assigned_staff: "Dr. Sarah Johnson",
            department: "Emergency",
            check_in_time: "09:45",
            status: "in-progress",
          },
        ]);
      }

      setStaff([
        {
          id: 1,
          name: "Dr. Sarah Johnson",
          role: "Physician",
          department: "Emergency",
          status: "available",
          patients_assigned: 3,
          efficiency: 92,
        },
        {
          id: 2,
          name: "Dr. Michael Chen",
          role: "Physician",
          department: "General",
          status: "busy",
          patients_assigned: 5,
          efficiency: 88,
        },
        {
          id: 3,
          name: "Nurse Emily Davis",
          role: "Nurse",
          department: "Emergency",
          status: "available",
          patients_assigned: 2,
          efficiency: 95,
        },
        {
          id: 4,
          name: "Dr. James Wilson",
          role: "Physician",
          department: "Surgery",
          status: "off-duty",
          patients_assigned: 0,
          efficiency: 90,
        },
        {
          id: 5,
          name: "Nurse Lisa Brown",
          role: "Nurse",
          department: "General",
          status: "busy",
          patients_assigned: 4,
          efficiency: 87,
        },
      ]);

      setDepartments([
        {
          name: "Emergency",
          current_load: 12,
          capacity: 20,
          avg_wait_time: 18,
          staff_on_duty: 4,
          efficiency: 91,
        },
        {
          name: "General",
          current_load: 8,
          capacity: 15,
          avg_wait_time: 25,
          staff_on_duty: 3,
          efficiency: 85,
        },
        {
          name: "Surgery",
          current_load: 3,
          capacity: 8,
          avg_wait_time: 45,
          staff_on_duty: 2,
          efficiency: 88,
        },
        {
          name: "Pediatrics",
          current_load: 5,
          capacity: 10,
          avg_wait_time: 20,
          staff_on_duty: 2,
          efficiency: 92,
        },
      ]);

      setAlerts([
        {
          id: 1,
          type: "critical",
          message: "Code Blue in Room 204 - Immediate response required",
          time: "2 min ago",
          acknowledged: false,
        },
        {
          id: 2,
          type: "warning",
          message: "Emergency department at 85% capacity",
          time: "5 min ago",
          acknowledged: false,
        },
        {
          id: 3,
          type: "info",
          message: "Dr. James Wilson shift ending in 30 minutes",
          time: "10 min ago",
          acknowledged: true,
        },
      ]);

      setLoading(false);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setLoading(false);
    }
  };

  const acknowledgeAlert = (alertId: number) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const handleSort = (field: "name" | "status" | "wait-time") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const togglePatientSelection = (patientId: number) => {
    setSelectedPatients((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    );
  };

  const toggleCardExpansion = (cardId: number) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const handleExportData = () => {
    const data = {
      stats,
      patients,
      staff,
      departments,
      alerts,
      exportTime: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-export-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddPatient = async () => {
    try {
      // Create a new patient object
      const newPatient = {
        name: "New Patient",
        age: 30,
        date_of_birth: "1994-01-01",
        id_passport: "TEMP000001",
        triage_level: "delayed",
        wait_time: 0,
        department: "Emergency",
        check_in_time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "waiting",
      };

      // Save to API first
      const response = await patientsApi.create(newPatient);

      // Add the new patient to the local state with the ID from the server
      if (response.data) {
        setPatients((prev) => [response.data, ...prev]);

        // Mark that we have manual patients to prevent auto-refresh from overriding
        setHasManualPatients(true);

        // Show a success message or alert
        setAlerts((prev) => [
          {
            id: Date.now(),
            type: "info",
            message: `Patient ${response.data.name} added successfully to database`,
            time: "Just now",
            acknowledged: false,
          },
          ...prev,
        ]);
      }
    } catch (error) {
      console.error("Error adding patient:", error);
      // Fallback to local-only addition if API fails
      const fallbackPatient = {
        name: "New Patient",
        age: 30,
        date_of_birth: "1994-01-01",
        id_passport: "TEMP000001",
        triage_level: "delayed" as const,
        wait_time: 0,
        department: "Emergency",
        check_in_time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "waiting" as const,
        id: Math.max(...patients.map((p) => p.id), 0) + 1,
      };

      setPatients((prev) => [fallbackPatient, ...prev]);
      setHasManualPatients(true);

      setAlerts((prev) => [
        {
          id: Date.now(),
          type: "warning",
          message: "Patient added locally (API unavailable)",
          time: "Just now",
          acknowledged: false,
        },
        ...prev,
      ]);
    }
  };

  const triggerCelebration = (patient: Patient) => {
    console.log("Celebration triggered for patient:", patient.name);
  };

  const handlePatientAction = async (action: string, patient: Patient) => {
    try {
      switch (action) {
        case "view":
          console.log("View patient details:", patient.id);
          // Could open a modal with full patient details
          break;
        case "edit":
          console.log("Edit patient:", patient.id);
          // Could open an edit form
          break;
        case "assign":
          console.log("Assign staff to patient:", patient.id);
          // Could open staff assignment modal
          break;
        case "complete":
          // Update patient status in database
          const updatedPatient = { ...patient, status: "completed" as const };
          await patientsApi.update(patient.id, updatedPatient);
          setPatients((prev) =>
            prev.map((p) =>
              p.id === patient.id ? { ...p, status: "completed" as const } : p
            )
          );

          // Check if patient qualifies for celebration (age 4-12, non-urgent triage)
          if (
            patient.age >= 4 &&
            patient.age <= 12 &&
            (patient.triage_level === "delayed" ||
              patient.triage_level === "minor")
          ) {
            triggerCelebration(patient);
          }

          setAlerts((prev) => [
            {
              id: Date.now(),
              type: "info",
              message: `Patient ${patient.name} marked as completed in database`,
              time: "Just now",
              acknowledged: false,
            },
            ...prev,
          ]);
          break;
        case "remove":
          // Remove patient from database
          await patientsApi.delete(patient.id);
          setPatients((prev) => prev.filter((p) => p.id !== patient.id));
          setAlerts((prev) => [
            {
              id: Date.now(),
              type: "warning",
              message: `Patient ${patient.name} removed from database`,
              time: "Just now",
              acknowledged: false,
            },
            ...prev,
          ]);
          break;
        default:
          console.log(`Unknown action: ${action} for patient ${patient.id}`);
      }
    } catch (error) {
      console.error(`Error performing ${action} on patient:`, error);
      // Fallback to local-only updates if API fails
      switch (action) {
        case "complete":
          setPatients((prev) =>
            prev.map((p) =>
              p.id === patient.id ? { ...p, status: "completed" as const } : p
            )
          );
          setAlerts((prev) => [
            {
              id: Date.now(),
              type: "warning",
              message: `Patient ${patient.name} marked as completed locally (API unavailable)`,
              time: "Just now",
              acknowledged: false,
            },
            ...prev,
          ]);
          break;
        case "remove":
          setPatients((prev) => prev.filter((p) => p.id !== patient.id));
          setAlerts((prev) => [
            {
              id: Date.now(),
              type: "warning",
              message: `Patient ${patient.name} removed locally (API unavailable)`,
              time: "Just now",
              acknowledged: false,
            },
            ...prev,
          ]);
          break;
      }
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedPatients.length === 0) {
      setAlerts((prev) => [
        {
          id: Date.now(),
          type: "warning",
          message: "No patients selected for bulk action",
          time: "Just now",
          acknowledged: false,
        },
        ...prev,
      ]);
      return;
    }

    switch (action) {
      case "assign":
        console.log("Bulk assign staff to patients:", selectedPatients);
        break;
      case "complete":
        setPatients((prev) =>
          prev.map((p) =>
            selectedPatients.includes(p.id)
              ? { ...p, status: "completed" as const }
              : p
          )
        );
        setAlerts((prev) => [
          {
            id: Date.now(),
            type: "info",
            message: `${selectedPatients.length} patients marked as completed`,
            time: "Just now",
            acknowledged: false,
          },
          ...prev,
        ]);
        setSelectedPatients([]);
        break;
      case "remove":
        setPatients((prev) =>
          prev.filter((p) => !selectedPatients.includes(p.id))
        );
        setAlerts((prev) => [
          {
            id: Date.now(),
            type: "warning",
            message: `${selectedPatients.length} patients removed from queue`,
            time: "Just now",
            acknowledged: false,
          },
          ...prev,
        ]);
        setSelectedPatients([]);
        break;
      default:
        console.log(`Unknown bulk action: ${action}`);
    }
  };

  const handleAddStaff = () => {
    // Create a new staff member
    const newStaff = {
      id: Math.max(...staff.map((s) => s.id), 0) + 1,
      name: "New Staff Member",
      role: "Physician",
      department: "Emergency",
      status: "available" as const,
      patients_assigned: 0,
      efficiency: 85,
    };

    // Add the new staff to the list
    setStaff((prev) => [...prev, newStaff]);

    // Show a success message or alert
    setAlerts((prev) => [
      {
        id: Date.now(),
        type: "info",
        message: `New staff member ${newStaff.name} added successfully`,
        time: "Just now",
        acknowledged: false,
      },
      ...prev,
    ]);
  };

  const handleStaffAction = (action: string, staffMember: Staff) => {
    switch (action) {
      case "view":
        console.log("View staff profile:", staffMember.id);
        // Could open a modal with full staff details
        break;
      case "contact":
        console.log("Contact staff:", staffMember.id);
        // Could open contact form or messaging interface
        break;
      case "page":
        console.log("Page staff:", staffMember.id);
        // Send a page notification to the staff member
        setAlerts((prev) => [
          {
            id: Date.now(),
            type: "info",
            message: `Page sent to ${staffMember.name}`,
            time: "Just now",
            acknowledged: false,
          },
          ...prev,
        ]);
        break;
      case "assign":
        console.log("Assign patients to staff:", staffMember.id);
        // Could open patient assignment modal
        break;
      case "toggle-status":
        // Toggle staff availability
        const newStatus =
          staffMember.status === "available" ? "off-duty" : "available";
        setStaff((prev) =>
          prev.map((s) =>
            s.id === staffMember.id
              ? { ...s, status: newStatus as Staff["status"] }
              : s
          )
        );
        setAlerts((prev) => [
          {
            id: Date.now(),
            type: "info",
            message: `${staffMember.name} status changed to ${newStatus}`,
            time: "Just now",
            acknowledged: false,
          },
          ...prev,
        ]);
        break;
      default:
        console.log(`Unknown action: ${action} for staff ${staffMember.id}`);
    }
  };

  const handleTriageUpdate = (patientId: number, newTriage: string) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? { ...p, triage_level: newTriage as Patient["triage_level"] }
          : p
      )
    );
    setAlerts((prev) => [
      {
        id: Date.now(),
        type: "info",
        message: `Patient triage level updated to ${newTriage}`,
        time: "Just now",
        acknowledged: false,
      },
      ...prev,
    ]);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "emergency":
        setAlerts((prev) => [
          {
            id: Date.now(),
            type: "critical",
            message:
              "Emergency protocol activated - All available staff notified",
            time: "Just now",
            acknowledged: false,
          },
          ...prev,
        ]);
        break;
      case "add-patient":
        // Navigate to add patient form or open modal
        console.log("Add new patient");
        break;
      case "schedule":
        // Open scheduling interface
        console.log("Manage appointments");
        break;
      case "reports":
        // Generate reports
        handleExportData();
        break;
      case "messaging":
        // Open messaging interface
        console.log("Open messaging");
        break;
      case "settings":
        // Open settings panel
        console.log("Open settings");
        break;
      default:
        console.log(`Quick action: ${action}`);
    }
  };

  const filteredPatients = patients
    .filter((patient) => {
      const matchesSearch = patient.name
        ? patient.name.toLowerCase().includes(searchTerm.toLowerCase())
        : false;
      const matchesDepartment =
        selectedDepartment === "all" ||
        patient.department === selectedDepartment;
      return matchesSearch && matchesDepartment;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        case "status":
          comparison = (a.status || "").localeCompare(b.status || "");
          break;
        case "wait-time":
          comparison = (a.wait_time || 0) - (b.wait_time || 0);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <FaCheckCircle className="status-available" />;
      case "busy":
        return <FaExclamationTriangle className="status-busy" />;
      case "off-duty":
        return <FaTimes className="status-off-duty" />;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Admin Dashboard</h1>
            <p>Healthcare Operations Command Center</p>
          </div>
          <div className="header-actions">
            <div className="search-bar">
              <FaSearch />
              <input
                type="text"
                placeholder="Search patients, staff, departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-primary" onClick={loadDashboardData}>
              <FaSync /> Refresh
            </button>
            <button
              className="btn-secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter /> Filters
            </button>
            <button className="btn-secondary" onClick={handleExportData}>
              <FaDownload /> Export
            </button>
            <button className="btn-secondary" onClick={() => window.print()}>
              <FaPrint /> Print
            </button>
            <button className="btn-secondary">
              <FaCog /> Settings
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-section">
            <h4>
              <FaFilter /> Filters
            </h4>
            <div className="filter-controls">
              <div className="filter-group">
                <label htmlFor="sort-select">Sort By:</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value as any)}
                  aria-label="Sort patients by"
                >
                  <option value="name">Name</option>
                  <option value="status">Status</option>
                  <option value="wait-time">Wait Time</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="order-select">Sort Order:</label>
                <select
                  id="order-select"
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "asc" | "desc")
                  }
                  aria-label="Sort order"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="auto-refresh">Auto Refresh:</label>
                <div className="toggle-group">
                  <input
                    id="auto-refresh"
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    aria-label="Toggle auto refresh"
                  />
                  <span>Enabled</span>
                </div>
              </div>
              <div className="filter-group">
                <label htmlFor="refresh-interval">Refresh Interval:</label>
                <select
                  id="refresh-interval"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  disabled={!autoRefresh}
                  aria-label="Refresh interval"
                >
                  <option value={5}>5 seconds</option>
                  <option value={10}>10 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-nav">
        <button
          className={`nav-btn ${selectedView === "overview" ? "active" : ""}`}
          onClick={() => setSelectedView("overview")}
        >
          <FaTachometerAlt /> Overview
        </button>
        <button
          className={`nav-btn ${selectedView === "patients" ? "active" : ""}`}
          onClick={() => setSelectedView("patients")}
        >
          <FaUsers /> Patients
        </button>
        <button
          className={`nav-btn ${selectedView === "staff" ? "active" : ""}`}
          onClick={() => setSelectedView("staff")}
        >
          <FaUserMd /> Staff
        </button>
        <button
          className={`nav-btn ${selectedView === "analytics" ? "active" : ""}`}
          onClick={() => setSelectedView("analytics")}
        >
          <FaChartBar /> Analytics
        </button>
      </div>

      <div className="alerts-section">
        <div className="alerts-header">
          <h3>
            <FaBell /> Active Alerts
          </h3>
          <span className="alert-count">
            {alerts.filter((a) => !a.acknowledged).length}
          </span>
        </div>
        <div className="alerts-list">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`alert-item alert-${alert.type} ${
                alert.acknowledged ? "acknowledged" : ""
              }`}
            >
              <div className="alert-content">
                <span className="alert-message">{alert.message}</span>
                <span className="alert-time">{alert.time}</span>
              </div>
              {!alert.acknowledged && (
                <button
                  className="btn-small acknowledge-btn"
                  onClick={() => acknowledgeAlert(alert.id)}
                >
                  Acknowledge
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedView === "overview" && (
        <div className="overview-section">
          <div className="stats-grid">
            <div className="stat-card stat-waiting">
              <div className="stat-icon">
                <FaHourglassHalf />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats?.waiting_count || "0"}</div>
                <div className="stat-label">Waiting</div>
                <div className="stat-change positive">
                  <FaArrowDown /> 12% from yesterday
                </div>
              </div>
            </div>

            <div className="stat-card stat-progress">
              <div className="stat-icon">
                <FaUserMd />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {stats?.in_progress_count || "0"}
                </div>
                <div className="stat-label">In Progress</div>
                <div className="stat-change neutral">
                  <FaMinus /> No change
                </div>
              </div>
            </div>

            <div className="stat-card stat-completed">
              <div className="stat-icon">
                <FaCheckCircle />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {stats?.completed_count || "0"}
                </div>
                <div className="stat-label">Completed</div>
                <div className="stat-change positive">
                  <FaArrowUp /> 8% from yesterday
                </div>
              </div>
            </div>

            <div className="stat-card stat-wait-time">
              <div className="stat-icon">
                <FaStopwatch />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {stats?.avg_wait_time
                    ? `${Math.round(parseFloat(stats.avg_wait_time))} min`
                    : "N/A"}
                </div>
                <div className="stat-label">Avg Wait Time</div>
                <div className="stat-change positive">
                  <FaArrowDown /> 5 min improvement
                </div>
              </div>
            </div>

            <div className="stat-card stat-immediate">
              <div className="stat-icon">
                <FaAmbulance />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {stats?.immediate_count || "0"}
                </div>
                <div className="stat-label">Immediate</div>
                <div className="stat-change negative">
                  <FaArrowUp /> 2 new cases
                </div>
              </div>
            </div>

            <div className="stat-card stat-urgent">
              <div className="stat-icon">
                <FaExclamationTriangle />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats?.urgent_count || "0"}</div>
                <div className="stat-label">Urgent</div>
                <div className="stat-change neutral">
                  <FaMinus /> Stable
                </div>
              </div>
            </div>
          </div>

          <div className="departments-grid">
            <div className="section-header">
              <h3>
                <FaHospital /> Department Status
              </h3>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                aria-label="Filter by department"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.name} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            {departments.map((dept) => (
              <div key={dept.name} className="department-card">
                <div className="department-header">
                  <h4>{dept.name}</h4>
                  <div className="department-efficiency">
                    {dept.efficiency}%
                  </div>
                </div>
                <div className="department-metrics">
                  <div className="metric">
                    <span className="metric-label">Load</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        data-width={Math.round(
                          (dept.current_load / dept.capacity) * 100
                        ).toString()}
                      />
                    </div>
                    <span className="metric-value">
                      {dept.current_load}/{dept.capacity}
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Wait Time</span>
                    <span className="metric-value">
                      {dept.avg_wait_time} min
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Staff</span>
                    <span className="metric-value">
                      {dept.staff_on_duty} on duty
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedView === "patients" && (
        <div className="patients-section">
          <div className="section-header">
            <h3>
              <FaUsers /> Patient Management
            </h3>
            <div className="section-actions">
              <button className="btn-primary" onClick={handleAddPatient}>
                <FaPlus /> New Patient
              </button>
              <button className="btn-secondary">
                <FaDownload /> Export
              </button>
            </div>
          </div>

          {selectedPatients.length > 0 && (
            <div className="bulk-actions">
              <div className="bulk-info">
                {selectedPatients.length} patient
                {selectedPatients.length > 1 ? "s" : ""} selected
              </div>
              <div className="bulk-buttons">
                <button
                  className="btn-small"
                  onClick={() => handleBulkAction("assign")}
                >
                  <FaUserMd /> Assign Staff
                </button>
                <button
                  className="btn-small"
                  onClick={() => handleBulkAction("complete")}
                >
                  <FaCheckCircle /> Complete All
                </button>
                <button
                  className="btn-small"
                  onClick={() => handleBulkAction("remove")}
                >
                  <FaTimes /> Remove All
                </button>
              </div>
            </div>
          )}

          <div className="patients-grid">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="patient-card">
                <div className="card-header-actions">
                  <input
                    type="checkbox"
                    checked={selectedPatients.includes(patient.id)}
                    onChange={() => togglePatientSelection(patient.id)}
                    className="patient-checkbox"
                    aria-label={`Select patient ${patient.name}`}
                  />
                  <button
                    className="expand-btn"
                    onClick={() => toggleCardExpansion(patient.id)}
                  >
                    {expandedCard === patient.id ? (
                      <FaCompress />
                    ) : (
                      <FaExpand />
                    )}
                  </button>
                </div>
                <div className="patient-header">
                  <div className="patient-info">
                    <h4>{patient.name}</h4>
                    <span className="patient-age">{patient.age} years</span>
                  </div>
                  <div className="patient-triage">
                    <select
                      value={patient.triage_level}
                      onChange={(e) =>
                        handleTriageUpdate(patient.id, e.target.value)
                      }
                      className="triage-select"
                      aria-label={`Triage level for ${patient.name}`}
                    >
                      <option value="immediate">Immediate</option>
                      <option value="urgent">Urgent</option>
                      <option value="delayed">Delayed</option>
                      <option value="minor">Minor</option>
                    </select>
                  </div>
                </div>
                <div className="patient-details">
                  <div className="detail">
                    <FaClock />
                    <span>Wait: {patient.wait_time} min</span>
                  </div>
                  <div className="detail">
                    <FaUserMd />
                    <span>{patient.assigned_staff || "Unassigned"}</span>
                  </div>
                  <div className="detail">
                    <FaHospital />
                    <span>{patient.department}</span>
                  </div>
                  <div className="detail">
                    <FaCalendarAlt />
                    <span>{patient.check_in_time}</span>
                  </div>
                </div>
                {expandedCard === patient.id && (
                  <div className="expanded-content">
                    <div className="additional-details">
                      <h5>
                        <FaClipboard /> Additional Information
                      </h5>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>Patient ID:</label>
                          <span>#{patient.id.toString().padStart(6, "0")}</span>
                        </div>
                        <div className="detail-item">
                          <label>Priority:</label>
                          <span className="priority-badge">
                            {patient.triage_level}
                          </span>
                        </div>
                        <div className="detail-item">
                          <label>Estimated Wait:</label>
                          <span>{patient.wait_time + 10} minutes</span>
                        </div>
                        <div className="detail-item">
                          <label>Last Updated:</label>
                          <span>{new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="quick-actions">
                      <button className="action-btn-small">
                        <FaVideo /> Video Call
                      </button>
                      <button className="action-btn-small">
                        <FaEnvelope /> Send Message
                      </button>
                      <button className="action-btn-small">
                        <FaNotesMedical /> Add Notes
                      </button>
                    </div>
                  </div>
                )}
                <div className="patient-status">
                  <span className={`status-badge status-${patient.status}`}>
                    {patient.status.replace("-", " ")}
                  </span>
                </div>
                <div className="patient-actions">
                  <button
                    className="btn-small"
                    onClick={() => handlePatientAction("view", patient)}
                  >
                    <FaEye /> View
                  </button>
                  <button
                    className="btn-small"
                    onClick={() => handlePatientAction("edit", patient)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="btn-small"
                    onClick={() => handlePatientAction("complete", patient)}
                  >
                    <FaCheckCircle /> Complete
                  </button>
                  <button
                    className="btn-small"
                    onClick={() => handlePatientAction("remove", patient)}
                  >
                    <FaTimes /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedView === "staff" && (
        <div className="staff-section">
          <div className="section-header">
            <h3>
              <FaUserMd /> Staff Management
            </h3>
            <div className="section-actions">
              <button className="btn-primary" onClick={handleAddStaff}>
                <FaPlus /> Add Staff
              </button>
              <button className="btn-secondary">
                <FaClipboardList /> Schedule
              </button>
            </div>
          </div>

          <div className="staff-grid">
            {staff.map((member) => (
              <div key={member.id} className="staff-card">
                <div className="staff-header">
                  <div className="staff-info">
                    <h4>{member.name}</h4>
                    <span className="staff-role">{member.role}</span>
                  </div>
                  <div className="staff-status">
                    {getStatusIcon(member.status)}
                    <span className="status-text">{member.status}</span>
                  </div>
                </div>
                <div className="staff-details">
                  <div className="detail">
                    <FaHospital />
                    <span>{member.department}</span>
                  </div>
                  <div className="detail">
                    <FaUsers />
                    <span>{member.patients_assigned} patients</span>
                  </div>
                  <div className="detail">
                    <FaChartLine />
                    <span>{member.efficiency}% efficiency</span>
                  </div>
                </div>
                <div className="staff-actions">
                  <button
                    className="btn-small"
                    onClick={() => handleStaffAction("view", member)}
                  >
                    <FaEye /> View Profile
                  </button>
                  <button
                    className="btn-small"
                    onClick={() => handleStaffAction("contact", member)}
                  >
                    <FaPhoneAlt /> Contact
                  </button>
                  <button
                    className="btn-small"
                    onClick={() => handleStaffAction("page", member)}
                  >
                    <FaBell /> Page
                  </button>
                  <button
                    className="btn-small"
                    onClick={() => handleStaffAction("assign", member)}
                  >
                    <FaEdit /> Assign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedView === "analytics" && (
        <div className="analytics-section">
          <div className="section-header">
            <h3>
              <FaChartBar /> Analytics & Insights
            </h3>
            <div className="time-range-selector">
              <button
                className={`btn-small ${timeRange === "today" ? "active" : ""}`}
                onClick={() => setTimeRange("today")}
              >
                Today
              </button>
              <button
                className={`btn-small ${timeRange === "week" ? "active" : ""}`}
                onClick={() => setTimeRange("week")}
              >
                Week
              </button>
              <button
                className={`btn-small ${timeRange === "month" ? "active" : ""}`}
                onClick={() => setTimeRange("month")}
              >
                Month
              </button>
            </div>
          </div>

          <div className="analytics-grid">
            <div className="chart-card">
              <h4>Patient Flow Trends</h4>
              <div className="chart-placeholder">
                <FaChartArea />
                <p>Patient volume over time</p>
              </div>
            </div>

            <div className="chart-card">
              <h4>Triage Distribution</h4>
              <div className="chart-placeholder">
                <FaChartPie />
                <p>Triage level breakdown</p>
              </div>
            </div>

            <div className="chart-card">
              <h4>Department Performance</h4>
              <div className="chart-placeholder">
                <FaChartBar />
                <p>Efficiency metrics</p>
              </div>
            </div>

            <div className="chart-card">
              <h4>Staff Productivity</h4>
              <div className="chart-placeholder">
                <FaChartLine />
                <p>Performance analytics</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="quick-actions">
        <h3>
          <FaBolt /> Quick Actions
        </h3>
        <div className="actions-grid">
          <button
            className="action-btn emergency"
            onClick={() => handleQuickAction("emergency")}
          >
            <FaAmbulance />
            <span>Emergency</span>
          </button>
          <button
            className="action-btn"
            onClick={() => handleQuickAction("add-patient")}
          >
            <FaUserPlus />
            <span>Add Patient</span>
          </button>
          <button
            className="action-btn"
            onClick={() => handleQuickAction("schedule")}
          >
            <FaCalendarAlt />
            <span>Schedule</span>
          </button>
          <button
            className="action-btn"
            onClick={() => handleQuickAction("reports")}
          >
            <FaFileMedical />
            <span>Reports</span>
          </button>
          <button
            className="action-btn"
            onClick={() => handleQuickAction("messaging")}
          >
            <FaEnvelope />
            <span>Messaging</span>
          </button>
          <button
            className="action-btn"
            onClick={() => handleQuickAction("settings")}
          >
            <FaCog />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
