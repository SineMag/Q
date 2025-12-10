import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./Layout.css";
import { useAuth } from "../contexts/AuthContext";
import {
  FaTimes,
  FaCalendarAlt,
  FaInfoCircle,
  FaUserMd,
  FaLock,
} from "react-icons/fa";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dismissedEvents, setDismissedEvents] = useState<number[]>([]);
  const isLandingPage = location.pathname === "/";
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Check if patient is logged in from localStorage
  const patientData =
    localStorage.getItem("patientData") || localStorage.getItem("patientInfo");
  const isPatientLoggedIn = !!patientData;

  // Mock event data
  const publicEvents = [
    {
      id: 1,
      title: "Blood Donation Drive",
      date: "Wednesday, 10 Dec 2025",
      location: "Hall 5",
      description:
        "Blood donation drive at Hall 5. Refreshments will definitely be there before you donate! Come support our community and save lives.",
      isStaffOnly: false,
    },
  ];

  const staffEvents = [
    {
      id: 2,
      title: "Emergency Response Training",
      date: "Friday, 12 Dec 2025",
      location: "Conference Room A",
      description:
        "Mandatory emergency response training for all clinical staff. Please arrive 15 minutes early for registration.",
      isStaffOnly: true,
    },
    {
      id: 3,
      title: "New EHR System Training",
      date: "Monday, 15 Dec 2025",
      location: "Training Lab 2",
      description:
        "Hands-on training for the new Electronic Health Records system. All staff must complete this session.",
      isStaffOnly: true,
    },
  ];

  const allEvents =
    user?.role === "admin" ? [...publicEvents, ...staffEvents] : publicEvents;
  const visibleEvents = allEvents.filter(
    (event) => !dismissedEvents.includes(event.id)
  );

  const dismissEvent = (eventId: number) => {
    setDismissedEvents((prev) => [...prev, eventId]);
  };

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className={`layout ${isLandingPage ? "layout-landing" : ""}`}>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              <h1>Q</h1>
              <span className="logo-subtitle">Queue & Triage Companion</span>
            </Link>
            <nav className="nav">
              <div className="nav-links">
                {user ? (
                  <>
                    {user?.role === "admin" && (
                      <>
                        <Link
                          to="/dashboard"
                          className={isActive("/dashboard") ? "active" : ""}
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/patients"
                          className={isActive("/patients") ? "active" : ""}
                        >
                          Patients
                        </Link>
                        <Link
                          to="/admin/patient-management"
                          className={
                            isActive("/admin/patient-management")
                              ? "active"
                              : ""
                          }
                        >
                          Patient Records
                        </Link>
                        <Link
                          to="/queue"
                          className={isActive("/queue") ? "active" : ""}
                        >
                          Queue
                        </Link>
                        <Link
                          to="/check-in"
                          className={isActive("/check-in") ? "active" : ""}
                        >
                          Check In
                        </Link>
                      </>
                    )}
                    {(user || isPatientLoggedIn) && (
                      <>
                        {user ? (
                          <>
                            <Link
                              to="/"
                              className={isActive("/") ? "active" : ""}
                            >
                              Home
                            </Link>
                            <Link
                              to="/patients"
                              className={isActive("/patients") ? "active" : ""}
                            >
                              Patients
                            </Link>
                            <Link
                              to="/check-in"
                              className={isActive("/check-in") ? "active" : ""}
                            >
                              Check In
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              to="/patient-dashboard"
                              className={
                                isActive("/patient-dashboard") ? "active" : ""
                              }
                            >
                              Dashboard
                            </Link>
                            <Link
                              to="/check-in"
                              className={isActive("/check-in") ? "active" : ""}
                            >
                              Check In
                            </Link>
                          </>
                        )}
                        <button onClick={logout} className="logout-button">
                          Logout
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  !isLandingPage && (
                    <>
                      <Link
                        to="/login"
                        className={isActive("/login") ? "active" : ""}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className={isActive("/register") ? "active" : ""}
                      >
                        Register
                      </Link>
                    </>
                  )
                )}
              </div>

              {user && (
                <div className="mobile-menu-container" ref={mobileMenuRef}>
                  <button
                    className="mobile-menu-button"
                    onClick={toggleMobileMenu}
                    aria-label="Toggle menu"
                  >
                    <div className="three-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </button>
                  <div
                    className={`mobile-dropdown ${
                      isMobileMenuOpen ? "dropdown-open" : ""
                    }`}
                  >
                    {user?.role === "admin" ? (
                      <>
                        <button
                          onClick={() => {
                            navigate("/dashboard");
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Dashboard
                        </button>
                        <button
                          onClick={() => {
                            navigate("/patients");
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Patients
                        </button>
                        <button
                          onClick={() => {
                            navigate("/admin/patient-management");
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Patient Records
                        </button>
                        <button
                          onClick={() => {
                            navigate("/queue");
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Queue
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            navigate("/");
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Home
                        </button>
                        <button
                          onClick={() => {
                            navigate("/patients");
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Patients
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        navigate("/check-in");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Check In
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hospital Updates Pop-up */}
      {user && visibleEvents.length > 0 && (
        <div className="hospital-update">
          <div className="update-content">
            <div className="update-icon">
              <FaCalendarAlt />
            </div>
            <div className="update-info">
              <div className="update-header">
                <FaInfoCircle />
                <h4>
                  {visibleEvents.length > 1
                    ? "Upcoming Events"
                    : "Upcoming Event"}
                  {user?.role === "admin" && (
                    <span className="event-count">
                      ({visibleEvents.length})
                    </span>
                  )}
                </h4>
              </div>
              <div className="events-list">
                {visibleEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`event-item ${
                      event.isStaffOnly ? "staff-event" : ""
                    }`}
                  >
                    <div className="event-header">
                      <strong>{event.date}</strong>
                      <div className="event-actions">
                        {event.isStaffOnly && (
                          <span className="staff-badge" title="Staff Only">
                            <FaUserMd />
                            <FaLock />
                          </span>
                        )}
                        <button
                          className="event-close"
                          onClick={() => dismissEvent(event.id)}
                          aria-label={`Dismiss ${event.title}`}
                          title={`Dismiss ${event.title}`}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                    <p>
                      <strong>{event.title}</strong> - {event.location}.{" "}
                      {event.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className={`main ${isLandingPage ? "main-landing" : ""}`}>
        {children}
      </main>

      <footer className="footer">
        <div className="container">
          <p>
            &copy; 2025 Q Healthcare System | Built with care for better patient
            flow | StackSisters Team
          </p>
        </div>
      </footer>
    </div>
  );
}
