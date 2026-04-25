import React from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import "../styles/sidebar.css";

function Sidebar() {
  const location = useLocation(); // ✅ Now location is defined

  return (
    <div className="sidebar">
      <h2 className="logo">CivicAI</h2>
      <ul>
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
            Dashboard
          </NavLink>
        </li>
       

        <li>
          <NavLink to="/form" className={({ isActive }) => (isActive ? "active" : "")}>
            Report Issue
          </NavLink>
        </li>
        <li>
          <NavLink to="/complaints" className={({ isActive }) => (isActive ? "active" : "")}>
            View Complaints
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/map"
            className={location.pathname === "/map" ? "active" : ""}
          >
            View Map
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
