// src/component-page/Admin/AdminDashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../../scss/admin.scss";

function AdminDashboard({ onLogout }) {
  return (
    <div className="admin-dashboard">
      <h2 className="admin-dashboard-title">Admin Dashboard</h2>
      <p className="admin-dashboard-subtitle">Welcome, Admin! This is your dashboard.</p>

      <div className="admin-dashboard-buttons">
        <Link to="/admin/catalog">
          <button>Manage Catalog</button>
        </Link>

        <Link to="/admin/manage-admins">
          <button>Manage Admins</button>
        </Link>

        <button onClick={onLogout}>Logout</button>
      </div>
    </div>
  );  
}

export default AdminDashboard;
