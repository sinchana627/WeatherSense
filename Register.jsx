import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Login.css"; // Reuse same CSS

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(""); // for password mismatch
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    const normalized = email.trim().toLowerCase();
    if (!validateEmail(normalized)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    // Dummy registration success
    // Persist the chosen username, email, and city so profile can show all details
    try {
      localStorage.setItem('username', username);
      localStorage.setItem('email', email);
      localStorage.setItem('city', city);
    } catch (err) { /* ignore */ }
    alert(`Welcome, ${username}! Registration successful.`);
    navigate("/login");
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
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={e => setCity(e.target.value)}
            required
          />
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
          <input 
            type="password" 
            placeholder="Confirm Password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
          />
          {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
          <button type="submit" disabled={!validateEmail(email.trim().toLowerCase()) || !username || !password || !confirmPassword}>Register</button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
