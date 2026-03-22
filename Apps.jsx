// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link } from "react-router-dom";
import "../css/App.css";

import Login from "./Login.jsx";
import Register from "./Register.jsx";
// ...existing code...
import Dashboard from "./Dashboard.jsx";
import LoadWelcome from "./Welcome.jsx";
import Header from './Header.jsx';

// Layout for routes with NavBar
function LayoutWithNav() {
  return (
    <>
      <Header />
      <div className="header-spacer" />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login & Register without navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes with NavBar */}
        <Route element={<LayoutWithNav />}>
          <Route path="/" element={<LoadWelcome />} />
          <Route path="/dashboard" element={<Dashboard />} />
// ...existing code...
        </Route>

        {/* Redirect any unknown route to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
