// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

// Import your components
import Login from "./component-page/Login"; 
import Register from "./component-page/Register";
import Home from "./component-page/body/Home";
import AdminForm from "./component-page/Admin/AdminForm";
import AdminDashboard from "./component-page/Admin/AdminDashborad";
import AdminCatalog from "./component-page/Admin/AdminCatalog";
import AdminManageAdmins from "./component-page/Admin/AdminManageAdmins";
import Cart from "./component-page/Cart";
function App() {
  const [user, setUser] = useState(null);       
  const [error, setError] = useState("");       
  const [isAdmin, setIsAdmin] = useState(false);

  // -- Admin Login --
  const handleAdminLogin = async (email, password, navigate) => {
    try {
      const response = await axios.post("http://localhost/api.php/admin-login", { email, password });
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
      setIsAdmin(true);
      setError("");
      navigate("/admin/dashboard");
    } catch (error) {
      setError(error.response?.data?.error || "Admin login failed. Please try again.");
    }
  };

  // -- User Register --
  const handleRegister = async (name, email, password, phone) => {
    try {
      const response = await axios.post("http://localhost/api.php/register", {
        name, email, password, phone
      });
      localStorage.setItem("token", response.data.token);
      setUser({ name, email });
      setError("");
      console.log("Registration successful");
    } catch (error) {
      console.error("Registration failed:", error.response?.data);
      setError(error.response?.data?.error || "Registration failed. Please try again.");
    }
  };

  // -- User Login --
  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post("http://localhost/api.php/login", { email, password });
      localStorage.setItem("token", response.data.token);
      setUser({ name: response.data.user.name, email: response.data.user.email });
      setError("");
    } catch (error) {
      setError(error.response?.data?.error || "Login failed. Please check your credentials.");
    }
  };

  // -- Logout --
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route
          path="/login"
          element={
            !user ? (
              <Login onLogin={handleLogin} errorMessage={error} />
            ) : (
              <Navigate to="/home" />
            )
          }
        />
        <Route
          path="/register"
          element={
            !user ? (
              <Register onRegister={handleRegister} errorMessage={error} />
            ) : (
              <Navigate to="/home" />
            )
          }
        />

        {/* PROTECTED USER ROUTE */}
        <Route
          path="/home"
          element={
            user ? (
              <Home user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* ADMIN LOGIN */}
        <Route
          path="/home/admin"
          element={<AdminForm onLogin={handleAdminLogin} errorMessage={error} />}
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin/dashboard"
          element={
            isAdmin
              ? <AdminDashboard onLogout={handleLogout} />
              : <Navigate to="/home/admin" />
          }
        />

        {/* ADMIN CATALOG CRUD */}
        <Route
          path="/admin/catalog"
          element={
            isAdmin
              ? <AdminCatalog />
              : <Navigate to="/home/admin" />
          }
        />
        {/*MANAGE ADMINS  */}
        <Route
          path="/admin/manage-admins"
          element={
            isAdmin
              ? <AdminManageAdmins />
              : <Navigate to="/home/admin" />
          }
        />
        {/*CART PAGE */}
        <Route path="/cart" element={<Cart />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
