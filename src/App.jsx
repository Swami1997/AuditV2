import React, { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import CheckList from "./components/CheckList";

const App = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [accessedLocations, setAccessedLocations] = useState("");

  const handleLogout = () => {
    setUser(null);
    localStorage.setItem("UserMail", null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 2000);
  };

  const styles = {
    appContainer: {
      position: "relative",
      minHeight: "100vh",
    },
    header: {
      position: "fixed",
      top: 0,
      right: 0,
      padding: "1rem",
      zIndex: 1000,
      width: "100%",
      display: "flex",
      justifyContent: "flex-end",
      background: "transparent",
    },
    logoutButton: {
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      padding: "0.5rem 1rem",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: 600,
      transition: "all 0.3s ease",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    loadingOverlay: {
      position: "fixed",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      zIndex: 9999,
    },
    loadingSpinner: {
      width: "50px",
      height: "50px",
      border: "3px solid rgba(255, 255, 255, 0.3)",
      borderTop: "3px solid #ffffff",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    loadingText: {
      marginTop: "1rem",
      fontSize: "1.25rem",
      fontWeight: 600,
      color: "#ffffff",
    },
  };

  return (
    <div style={styles.appContainer}>
      {location.pathname === "/checklist" && (
        <div style={styles.header}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      )}
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Logging Out...</p>
        </div>
      )}
      <Routes>
        <Route path="/" element={<LoginPage user={user} setUser={setUser} />} />
        <Route
          path="/checklist"
          element={<CheckList user={user} setUser={setUser} />}
        />
      </Routes>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @media screen and (max-width: 768px) {
            ${styles.header.selector} {
              padding: 0.75rem;
            }
            ${styles.logoutButton.selector} {
              padding: 0.4rem 0.8rem;
              font-size: 0.9rem;
            }
          }
          @media screen and (max-width: 480px) {
            ${styles.header.selector} {
              padding: 0.5rem;
            }
            ${styles.logoutButton.selector} {
              padding: 0.3rem 0.6rem;
              font-size: 0.8rem;
            }
          }
        `}
      </style>
    </div>
  );
};

export default App;
