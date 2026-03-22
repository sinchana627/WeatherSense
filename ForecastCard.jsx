// ForecastCard.jsx

import React from "react";
import "../css/dashboard.css";
import { getWeatherEmoji } from "./Dashboard";
import iconMap from '../assets/weather-icons/iconMap';

export default function ForecastCard({ day, timezone_offset = 0 }) {
  if (!day) return null;
  // Use backend fields
  let d;
  if (day.date) {
    // Accept both ISO and unix timestamp
    const unix = isNaN(day.date) ? Date.parse(day.date) / 1000 : Number(day.date);
    d = new Date((unix + timezone_offset) * 1000);
  } else {
    d = new Date();
  }
  const dayName = d.toLocaleDateString(undefined, { weekday: 'long' });
  const fullDate = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const isNight = false; // No night info in daily
  const condition = day.Condition || 'Unknown';
  // Try to use local icon for condition
  let iconFile = iconMap[condition] || null;
  let icon = null;
  if (iconFile) {
    try {
      icon = require(`../assets/weather-icons/${iconFile}`);
    } catch (e) {
      icon = null;
    }
  }
  // Fallback to OWM icon code if available
  if (!icon && day.Icon && day.Icon.length === 3 && /^[0-9]{2}[dn]$/.test(day.Icon)) {
    icon = `https://openweathermap.org/img/wn/${day.Icon}@2x.png`;
  }
  return (
    <div className="forecast-card" style={{ animation: "fadeIn 0.7s", transition: "transform 0.2s" }} title={condition}>
      <div className="forecast-date">{dayName} {fullDate}</div>
      <div className="forecast-icon" style={{ fontSize: '2em', textAlign: 'center', margin: '0.2em 0' }}>
        {icon ? <img src={icon} alt={condition} style={{width:'2em',height:'2em'}} /> : getWeatherEmoji(condition, isNight)}
      </div>
      <div className="forecast-desc">{condition}</div>
      <div className="forecast-temps">
        <span className="forecast-min">{day.min !== undefined ? Math.round(day.min) + '°' : '--'}</span>
        <span className="forecast-max">{day.max !== undefined ? Math.round(day.max) + '°' : '--'}</span>
      </div>
    </div>
  );
}
