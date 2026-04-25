import React from "react";
import "../styles/navbar.css";

function Navbar() {
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    window.location.href = "/login";
  };

  const user = JSON.parse(localStorage.getItem("userInfo"));

  return (
    <div className="navbar">
      {/* ===== LEFT SIDE: DASHBOARD TITLE ===== */}
      <h3>
        {user?.role === "admin" ? "Admin Dashboard" : "User Dashboard"}
      </h3>

      {/* ===== RIGHT SIDE: USER + LOGOUT ===== */}
      <div className="navbar-right">
        <span className="navbar-user">
          {user?.name ? `Hi, ${user.name}` : ""}
        </span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
