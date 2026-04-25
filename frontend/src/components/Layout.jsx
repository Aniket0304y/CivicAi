import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "../styles/layout.css"; // ✅ Use a layout-specific CSS file

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-area">
        <Navbar />
        <main className="content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
