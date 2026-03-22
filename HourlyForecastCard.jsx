// HourlyForecastCard.jsx

import React from "react";
import "../css/dashboard.css";
import { getWeatherEmoji } from "./Dashboard";
import iconMap from '../assets/weather-icons/iconMap';

export default function HourlyForecastCard({ hour, timezone_offset = 0 }) {
  if (!hour) return null;
  let timeStr = '--:--';
  if (hour.time) {
    // Accept both ISO and unix timestamp
    const unix = isNaN(hour.time) ? Date.parse(hour.time) / 1000 : Number(hour.time);
    let d = new Date((unix + timezone_offset) * 1000);
    let hourNum = d.getHours();
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    hourNum = hourNum % 12;
    if (hourNum === 0) hourNum = 12;
    timeStr = `${hourNum} ${ampm}`;
  }
  const condition = hour.Condition || 'Unknown';
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
  if (!icon && hour.Icon && hour.Icon.length === 3 && /^[0-9]{2}[dn]$/.test(hour.Icon)) {
    icon = `https://openweathermap.org/img/wn/${hour.Icon}@2x.png`;
  }
  return (
    <div className="hourly-forecast-card" style={{animation:'fadeIn 0.7s', transition:'transform 0.2s'}} title={condition}>
      <div className="hourly-time">{timeStr}</div>
      <div className="hourly-forecast-icon" style={{ fontSize: '1.7em', textAlign: 'center', margin: '0.2em 0' }}>
        {icon ? <img src={icon} alt={condition} style={{width:'1.7em',height:'1.7em'}} /> : getWeatherEmoji(condition, false)}
      </div>
      <div className="hourly-desc">{condition}</div>
      <div className="hourly-temp">{hour.temp !== undefined ? Math.round(hour.temp) : '--'}</div>
    </div>
  );
}
