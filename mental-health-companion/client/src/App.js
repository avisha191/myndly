import React from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Chatbot from "./pages/Chatbot";
import JournalTrends from "./pages/JournalTrends";
import JournalInsights from "./pages/JournalInsights";

// A calming background image for the entire app.
// You can replace this URL with your own.
const backgroundURL = "https://m.zenmix.io/cbi/l/relaxing-background-image-3.png";

// Private route wrapper
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

// Corrected Navbar component with fixed alignment
function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/"); // Go to the home page after logging out
  };

  // Dynamically build the links based on login status
  const loggedOutLinks = [
    { to: "/signup", label: "Signup" },
    { to: "/login", label: "Login" },
  ];

  const loggedInLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/journal", label: "Journal" },
    { to: "/chatbot", label: "Chatbot" },
    { to: "/trends", label: "Trends" },
    { to: "/insights", label: "Insights" },
  ];

  const links = token ? loggedInLinks : loggedOutLinks;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(8px)",
        padding: "12px 24px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <h2 style={{ margin: 0, color: "#4A4594", fontFamily: "Poppins, sans-serif" }}>
        <Link to={token ? "/dashboard" : "/"} style={{ textDecoration: "none", color: "inherit" }}>
          Myndly
        </Link>
      </h2>

      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              style={{
                textDecoration: "none",
                color: isActive ? "#fff" : "#333",
                padding: "8px 16px",
                borderRadius: "8px",
                background: isActive ? "#6C63FF" : "transparent",
                fontWeight: 500,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.background = "#6C63FF";
                  e.target.style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.background = "transparent";
                  e.target.style.color = "#333";
                }
              }}
            >
              {link.label}
            </Link>
          );
        })}
        {token && (
          <button 
            onClick={handleLogout} 
            style={{
              background: "none",
              border: "none",
              color: "#333",
              fontWeight: 500,
              cursor: "pointer",
              transition: "color 0.3s",
              padding: "8px 16px",
            }}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

// New WelcomeMessage component for the home page
function WelcomeMessage() {
  return (
    <div
      style={{
        height: "calc(100vh - 60px)", // Subtract navbar height
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "0 20px",
        color: "#333",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "3rem", margin: 0, color: "#4A4594" }}>Welcome to Myndly!</h1>
      <p style={{ fontSize: "1.2rem", maxWidth: "600px", marginTop: "10px", color: "#333" }}>
        Your personal space for mindful reflection, emotional well-being, and self-discovery.
      </p>
      <Link to="/login" style={{
        marginTop: "20px",
        padding: "12px 24px",
        backgroundColor: "#6C63FF",
        color: "white",
        textDecoration: "none",
        borderRadius: "10px",
        fontWeight: "bold",
        transition: "background-color 0.3s",
      }}>
        Get Started
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <div
      style={{
        backgroundImage: `url(${backgroundURL})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<WelcomeMessage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/journal"
            element={
              <PrivateRoute>
                <Journal />
              </PrivateRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <PrivateRoute>
                <Chatbot />
              </PrivateRoute>
            }
          />
          <Route path="/trends" element={<JournalTrends />} />
          <Route path="/insights" element={<JournalInsights />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}




