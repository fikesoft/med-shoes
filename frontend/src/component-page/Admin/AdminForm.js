import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminForm({ onLogin, errorMessage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleAdminLogin = (e) => {
    e.preventDefault();
    onLogin(email, password, navigate);
  };

  return (
    <div className="login" >
      <h2 className="login-title" >Admin Login</h2>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      <form onSubmit={handleAdminLogin} className="login-form" >
        <div className="login-form-row">
          <label>Email:</label>
          <input
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div className="login-form-row" >
          <label>Password:</label>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <button type="submit" className="login-form-submit" >Admin Login</button>
      </form>
    </div>
  );
}

export default AdminForm;
