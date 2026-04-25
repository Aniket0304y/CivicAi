import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ComplaintForm from "./components/ComplaintForm";
import ComplaintList from "./components/ComplaintList";
import AuthPortal from "./pages/AuthPortal";
import MapView from "./pages/MapView";

/**
 * Safe parse helper to avoid JSON.parse(null) crashing the app
 */
const getUserFromStorage = () => {
  try {
    const raw = localStorage.getItem("userInfo");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("Failed to parse userInfo from localStorage:", e);
    return null;
  }
};

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const userInfo = getUserFromStorage();

  // not logged in → go to auth portal
  if (!userInfo) return <Navigate to="/auth" replace />;

  // admin-only route but user is not admin → redirect to home
  if (adminOnly && userInfo.role !== "admin") return <Navigate to="/" replace />;

  return children;
};

function App() {
  return (
    <Router>
      <Routes>

        {/* Auth Portal */}
        <Route path="/auth" element={<AuthPortal />} />

        {/* Home Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Report Issue */}
        <Route
          path="/form"
          element={
            <ProtectedRoute>
              <ComplaintForm />
            </ProtectedRoute>
          }
        />

        {/* Admin complaints list */}
        <Route
          path="/complaints"
          element={
            <ProtectedRoute adminOnly={true}>
              <ComplaintList />
            </ProtectedRoute>
          }
        />

        {/* ✅ FIX: Map route added correctly */}
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <MapView />
            </ProtectedRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;
