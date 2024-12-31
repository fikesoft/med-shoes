import React, { useState } from "react";
import "../scss/login.scss"; // or wherever you place your styling

function Register({ onRegister, errorMessage }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(name, email, password, phone);
  };

  return (
    <div className="login">
      <h2 className="login-title">User Registration</h2>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-form-row">
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="login-form-row">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="login-form-row">
          <label>Phone:</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div className="login-form-row">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </div>

        <button type="submit" className="login-form-submit">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
