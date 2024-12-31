// src/component-page/Admin/AdminManageAdmins.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../scss/admin.scss";

function AdminManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState("");

  // CREATE form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  // EDIT states
  const [editingAdmin, setEditingAdmin] = useState(null); // which admin ID are we editing
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  // Fetch admins on load
  useEffect(() => {
    fetchAdmins();
  }, []);

  // Fetch all admins
  const fetchAdmins = async () => {
    try {
      const response = await axios.get("http://localhost/api.php/admins");
      setAdmins(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch admins.");
    }
  };

  // ========== CREATE ADMIN ==========
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateAdmin = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields (Name, Email, Password).");
      return;
    }

    try {
      await axios.post("http://localhost/api.php/admins", {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      setError("");
      // Clear create form
      setFormData({ name: "", email: "", password: "" });
      // Refresh admin list
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create admin.");
    }
  };

  // ========== DELETE ADMIN ==========
  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) {
      return;
    }

    try {
      await axios.delete("http://localhost/api.php/admins", {
        data: { id }
      });
      setError("");
      fetchAdmins(); // refresh list
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete admin.");
    }
  };

  // ========== EDIT ADMIN (setup + update) ==========

  
  const startEdit = (adm) => {
    setEditingAdmin(adm.id);
    // Pre-fill the form with existing name/email, but leave password blank
    setEditFormData({
      name: adm.name,
      email: adm.email,
      password: ""
    });
  };

  // 2) Handle input changes in the edit form
  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // 3) Submit the edit to the server
  const handleUpdateAdmin = async () => {
    if (!editingAdmin) return; // just a safeguard

    try {
      await axios.put("http://localhost/api.php/admins", {
        id: editingAdmin,
        name: editFormData.name,
        email: editFormData.email,
        password: editFormData.password // can be empty; PHP only updates if not empty
      });
      setError("");
      setEditingAdmin(null);
      setEditFormData({ name: "", email: "", password: "" });
      fetchAdmins(); // refresh list
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update admin.");
    }
  };

  return (
    <div className="admin-manage">
      <h2 className="admin-manage-title">Manage Admins</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* CREATE Admin Form */}
      <div className="manage-form">
        <h3>Create a New Admin</h3>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        <button onClick={handleCreateAdmin}>Create Admin</button>
      </div>

      {/* EDIT Admin Form (only visible when editingAdmin is set) */}
      {editingAdmin && (
        <div className="manage-form">
          <h3>Edit Admin (ID: {editingAdmin})</h3>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={editFormData.name}
            onChange={handleEditChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={editFormData.email}
            onChange={handleEditChange}
          />
          <input
            type="password"
            name="password"
            placeholder="New Password (optional)"
            value={editFormData.password}
            onChange={handleEditChange}
          />
          <button onClick={handleUpdateAdmin}>Update Admin</button>
          <button onClick={() => setEditingAdmin(null)}>Cancel</button>
        </div>
      )}

      {/* LIST OF ADMINS */}
      <h3 className="admin-manage-subtitle">List of Admins</h3>
      {admins.length === 0 ? (
        <p>No admins found.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Password (hashed)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((adm) => (
              <tr key={adm.id}>
                <td>{adm.id}</td>
                <td>{adm.name}</td>
                <td>{adm.email}</td>
                <td>{adm.password}</td>
                <td>
                  <button onClick={() => startEdit(adm)}>Edit</button>
                  <button onClick={() => handleDeleteAdmin(adm.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminManageAdmins;
