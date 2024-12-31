import React, { useState } from "react";
import { Link } from "react-router-dom";
//Import styling
import './../scss/login.scss'
function Login({ onLogin, errorMessage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="login">
      <h2 className="login-title">Welcome To Our Market</h2>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-form-row">
          <label>Email:</label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
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
        <div className="login-form-row">
        <button type="submit" className="login-form-submit">Login</button>
        <p className="register-text"><Link to='/register'>Register</Link></p>
        </div>
        
        
      </form>
    </div>
  );
}

export default Login;
