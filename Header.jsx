import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../css/Header.css';
import Profile from './Profile';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const showLinks = location && location.pathname === '/dashboard';
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState({
    name: (typeof window !== 'undefined' && localStorage.getItem('name')) || '',
    email: (typeof window !== 'undefined' && localStorage.getItem('email')) || '',
    username: (typeof window !== 'undefined' && localStorage.getItem('username')) || 'Guest',
    photo: (typeof window !== 'undefined' && localStorage.getItem('profilePhoto')) || ''
  });

  useEffect(() => {
    const onStorage = (e) => {
      if (['name','email','username','profilePhoto'].includes(e.key)) {
        setUser({
          name: localStorage.getItem('name') || '',
          email: localStorage.getItem('email') || '',
          username: localStorage.getItem('username') || 'Guest',
          photo: localStorage.getItem('profilePhoto') || ''
        });
      }
    };
    window.addEventListener && window.addEventListener('storage', onStorage);
    return () => window.removeEventListener && window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    try { localStorage.removeItem('username'); } catch (err) {}
    navigate('/login');
  }
  return (
    <header className="app-header" style={{ position: 'relative' }}>
      <div className="app-header-inner">
        {/* Welcome note at top of header, only on dashboard */}
        {/* Welcome note removed from header, will be placed in dashboard */}
        <Link to="/" className="app-brand">
          <svg className="app-icon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Weather icon">
            <defs>
              <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#FFD54A" />
                <stop offset="100%" stopColor="#FF8A65" />
              </linearGradient>
              <linearGradient id="g2" x1="0" x2="1">
                <stop offset="0%" stopColor="#ECEFF1" />
                <stop offset="100%" stopColor="#CFD8DC" />
              </linearGradient>
            </defs>
            {/* sun */}
            <circle cx="18" cy="18" r="8" fill="url(#g1)" />
            {/* cloud */}
            <g transform="translate(28,24)">
              <ellipse cx="10" cy="6" rx="12" ry="7" fill="url(#g2)" />
              <ellipse cx="4" cy="8" rx="6" ry="5" fill="url(#g2)" />
              <rect x="-2" y="10" width="28" height="6" rx="3" fill="url(#g2)" />
            </g>
          </svg>
          <span className="app-title">WeatherSense</span>
        </Link>
        {/* left = brand already rendered */}
        {/* No center nav links; only profile icon at top right on dashboard */}
        {/* right greeting: only show on dashboard */}
        {/* {location && location.pathname === '/dashboard' && (
          <div className="header-greeting">Welcome to Weather Sense!!</div>
        )} */}
        {/* Profile icon and user info at top right */}
        {/* Profile icon and links only on dashboard, at top right */}
        {location && location.pathname === '/dashboard' && (
          <div style={{ position: 'absolute', top: 12, right: 32, display: 'flex', alignItems: 'center', zIndex: 300 }}>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              title="Profile"
              onClick={() => setShowProfile(s => !s)}
            >
              {user.photo ? (
                <img src={user.photo} alt="Profile" style={{ width: 32, height: 32, borderRadius: '50%', boxShadow: '0 2px 8px #0002', objectFit: 'cover' }} />
              ) : (
                <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Profile" style={{ width: 32, height: 32, borderRadius: '50%', boxShadow: '0 2px 8px #0002' }} />
              )}
            </button>
            <button
              onClick={handleLogout}
              style={{ marginLeft: 16, background: '#d9534f', color: '#fff', border: 'none', borderRadius: 6, padding: '0.3em 1em', fontWeight: 600, cursor: 'pointer', fontSize: '1em' }}
            >
              Logout
            </button>
            {showProfile && (
              <div style={{ position: 'absolute', top: 44, right: 0, zIndex: 999 }}>
                <Profile user={user} onUpdate={u => setUser(u)} />
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
