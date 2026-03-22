import React from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import '../css/App.css'

import LoadLoginPage from "./Login.jsx";
// ...existing code...
import Dashboard from "./Dashboard.jsx";
import LoadWelcome from './Welcome.jsx'
import LoadRegisterPage from './Register.jsx'
import Header from './Header.jsx'

function AppContent() {
  return (
    <>
      <Header />
      <div className="header-spacer" />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<LoadWelcome />} />
        <Route path="/login" element={<LoadLoginPage />} />
        <Route path="/register" element={<LoadRegisterPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
