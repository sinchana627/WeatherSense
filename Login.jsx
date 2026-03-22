import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate email before proceeding
    const normalized = email.trim().toLowerCase();
    if (!validateEmail(normalized)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    // Dummy login redirect
    navigate("/dashboard");
  };

  const validateEmail = (em) => {
    if (!em) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(em);
  };

  const handleEmailBlur = (e) => {
    const normalized = e.target.value.trim().toLowerCase();
    setEmail(normalized);
    if (!validateEmail(normalized)) setEmailError("Please enter a valid email address.");
    else setEmailError("");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }} 
            onBlur={handleEmailBlur}
            aria-invalid={emailError ? "true" : "false"}
            required 
          />
          {emailError && <p style={{ color: "red", fontSize: "14px" }}>{emailError}</p>}
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" disabled={!validateEmail(email.trim().toLowerCase()) || !password}>Login</button>
        </form>
        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
