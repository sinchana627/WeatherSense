import React, { useEffect, useState, useCallback } from "react";
import "../css/dashboard.css";
import axios from "axios";
import WindGraph from "./Radialbar";
import Profile from "./Profile";
import MapPicker from './MapPicker';
import ForecastCard from "./ForecastCard";
import HourlyForecastCard from "./HourlyForecastCard";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faWind, faTint, faSpinner, faLocationArrow } from "@fortawesome/free-solid-svg-icons";
import { citySuggestions } from "./citySuggestions";
import iconMap from '../assets/weather-icons/iconMap';


// --- Dynamic background image based on weather condition and day/night ---
export function getBackground(weatherMain, isNight) {
  if (/thunderstorm/i.test(weatherMain)) return isNight ? 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
  if (/rain/i.test(weatherMain)) return isNight ? 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
  if (/drizzle/i.test(weatherMain)) return isNight ? 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
  if (/snow/i.test(weatherMain)) return isNight ? 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80' : 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80';
  if (/mist|fog/i.test(weatherMain)) return isNight ? 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=80' : 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=80';
  if (/cloud/i.test(weatherMain)) return isNight ? 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=80' : 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=80';
  if (/clear/i.test(weatherMain)) return isNight ? 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' : 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80';
  return isNight ? 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' : 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80';
}

// --- Weather emoji mapping ---
export function getWeatherEmoji(condition, isNight) {
  if (!condition) return '❔';
  if (/thunderstorm/i.test(condition)) return '⛈️';
  if (/rain/i.test(condition)) return '🌧️';
  if (/drizzle/i.test(condition)) return '🌦️';
  if (/snow/i.test(condition)) return '❄️';
  if (/mist|fog/i.test(condition)) return '🌫️';
  if (/cloud/i.test(condition)) return '☁️';
  if (/clear/i.test(condition)) return isNight ? '🌙' : '☀️';
  return '❔';
}


function Dashboard() {
  const [user, setUser] = useState({ name: "", email: "", city: "" });
  const [showProfile, setShowProfile] = useState(false);
  // State declarations
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [Location, setLocation] = useState("Mandya, Karnataka, India");
  const [Day, setDay] = useState("");
  const [DateStr, setDateStr] = useState("");
  const [timezoneOffset, setTimezoneOffset] = useState(0); // in seconds
  // searchLocation defaults to Mandya, Karnataka, India
  const [searchLocation, setSearchLocation] = useState("Mandya, Karnataka, India");
  const [Temp, setTemp] = useState(20);
  const [TempUnit, setTempUnit] = useState("C");
  const [FeelsLike, setFeelsLike] = useState(20);
  const [Cloud, setCloud] = useState(0);
  const [Humidity, setHumidity] = useState(70);
  const [Wind, setWind] = useState(6);
  const [WindUnit, setWindUnit] = useState("mph");
  const [WindDeg, setWindDeg] = useState(270);
  const [UVIndex, setUVIndex] = useState(5);
  const [Latitude, setLatitude] = useState(12.5223);
  const [Longitude, setLongitude] =  useState(76.89746);
  const [Time, setTime] = useState("");
  const [Pressure, setPressure] = useState(1013);
  const [Visibility, setVisibility] = useState(10);
  const [Precipitation, setPrecipitation] = useState(0);
  const [WeatherDesc, setWeatherDesc] = useState("");
  const [WeatherIcon, setWeatherIcon] = useState("");
  const [DewPoint, setDewPoint] = useState(null);
  const [MinTemp, setMinTemp] = useState(null);
  const [MaxTemp, setMaxTemp] = useState(null);
  const [Sunrise, setSunrise] = useState("");
  const [Sunset, setSunset] = useState("");
  const [forecast, setForecast] = useState([]);
  const [hourly, setHourly] = useState([]);
  // user-selectable display counts
  const [daysToShow, setDaysToShow] = useState(5);
  const [hoursToShow, setHoursToShow] = useState(8);
  const [targetDate, setTargetDate] = useState("");
  // Map picker modal state
  const [mapOpen, setMapOpen] = useState(false);
  // Default background (Pixabay) - sharp, clear image
  const [bgImage, setBgImage] = useState('https://cdn.pixabay.com/photo/2016/11/29/03/53/landscape-1869237_1280.jpg');

  // --- Date/Time helpers using API timezone offset ---
  // Format: Thursday, 25 December 2025
  function formatDateTime(unix, offsetSec = 0) {
    // unix is expected to be UTC seconds
    const d = new Date((unix + offsetSec) * 1000);
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const day = days[d.getUTCDay()];
    const date = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    return { day, date, time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` };
  }

  // Format time for hourly forecast (e.g., 12 AM, 1 PM)
  function formatHourlyTime(unix, offsetSec = 0) {
    if (!unix) return "--:--";
    const d = new Date((unix + offsetSec) * 1000);
    let hour = d.getUTCHours();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour} ${ampm}`;
  }

  // ---------- FETCH FUNCTIONS ----------
  const fetchData = useCallback((city = null, date = null) => {
    setLoading(true);
    let url = "http://localhost:5000/loadDashboard";
    const params = [];
    if (city) params.push(`city=${encodeURIComponent(city)}`);
    if (date || targetDate) {
      const d = date || targetDate;
      params.push(`startDate=${encodeURIComponent(d)}`);
      params.push(`endDate=${encodeURIComponent(d)}`);
    }
    if (params.length) url += `?${params.join('&')}`;

    axios.get(url)
      .then(res => {
        setLoading(false);
        const data = res.data && res.data.WeatherData ? res.data.WeatherData : res.data;
        if (!data || data.error) {
          setErrorMsg("No weather data found for this location.");
          setForecast([]);
          setHourly([]);
          return;
        }
        setErrorMsg("");
        // Set timezone offset if available (Open-Meteo: data.timezone_offset_seconds, OpenWeatherMap: data.timezone)
        if (typeof data.timezone_offset_seconds === 'number') setTimezoneOffset(data.timezone_offset_seconds);
        else if (typeof data.timezone === 'number') setTimezoneOffset(data.timezone);
        if (data.Location && !/^Lat:|^Lon:|^[\d.-]+$/.test(data.Location)) {
          setLocation(data.Location);
          setSearchLocation(data.Location);
        } else if (city && !/^Lat:|^Lon:|^[\d.-]+$/.test(city)) {
          setLocation(city);
          setSearchLocation(city);
        } else if (data.Latitude && data.Longitude) {
          setLocation('Loading location...');
          setSearchLocation('');
          clientReverseGeocode(data.Latitude, data.Longitude).then(label => {
            if (label) {
              setLocation(label);
              setSearchLocation(label);
            } else {
              setLocation(`Lat: ${data.Latitude}, Lon: ${data.Longitude}`);
            }
          }).catch(() => {
            setLocation(`Lat: ${data.Latitude}, Lon: ${data.Longitude}`);
          });
        } else {
          setLocation("Unknown");
          setSearchLocation("");
        }
        const primaryHourly = Array.isArray(data.Hourly) && data.Hourly.length ? data.Hourly[0] : null;
        const primaryDaily = Array.isArray(data.Forecast) && data.Forecast.length ? data.Forecast[0] : null;

        const currTemp = primaryHourly?.temp ?? primaryDaily?.max ?? data.Temp ?? "--";
        const currFeels = primaryHourly?.feels_like ?? data.FeelsLike ?? currTemp;
        const currCloud = primaryHourly?.cloudcover ?? data.Cloud ?? 0;
        const currWind = primaryHourly?.windspeed ?? data.Wind ?? 0;
        const currWindDeg = primaryHourly?.winddir ?? data.WindDeg ?? 0;
        const currUV = primaryHourly?.uv ?? data.UV ?? 0;
        const currHumidity = primaryHourly?.humidity ?? data.Humidity ?? 0;
        const currLat = data.latitude ?? data.Latitude ?? Latitude;
        const currLon = data.longitude ?? data.Longitude ?? Longitude;
        const currPressure = primaryHourly?.pressure ?? data.Pressure ?? Pressure;
        const currVisibility = primaryHourly?.visibility ?? data.Visibility ?? Visibility;
        const currPrecip = primaryHourly?.precipitation ?? data.Precipitation ?? Precipitation;
        const cond = primaryHourly?.condition ?? primaryDaily?.condition ?? data.Condition ?? "";
        const code = primaryHourly?.code ?? primaryDaily?.code ?? data.Code ?? null;
        const icon = primaryHourly?.icon ?? primaryDaily?.icon ?? data.Icon ?? "";

        setTemp(currTemp);
        setFeelsLike(currFeels);
        setCloud(currCloud);
        setWind(currWind);
        setWindDeg(currWindDeg);
        setUVIndex(currUV);
        setHumidity(currHumidity);
        setLatitude(currLat);
        setLongitude(currLon);
        setPressure(currPressure);
        setVisibility(currVisibility);
        setPrecipitation(currPrecip);
        setWeatherDesc(cond);
        setWeatherIcon(icon);
        const useCode = code ?? data.Code ?? null;
        const useCond = cond || data.Condition || "";
        // Use new helper for dynamic background
        let main = data.weather && data.weather[0] && data.weather[0].main ? data.weather[0].main : useCond;
        let iconCode = data.weather && data.weather[0] && data.weather[0].icon ? data.weather[0].icon : '';
        const isNight = iconCode && iconCode.endsWith('n');
        setBgImage(getBackground(main, isNight));
        setDewPoint(data.DewPoint ?? null);
        setMinTemp(primaryDaily?.min ?? data.MinTemp ?? null);
        setMaxTemp(primaryDaily?.max ?? data.MaxTemp ?? null);
        setSunrise(data.Sunrise || "");
        setSunset(data.Sunset || "");
        // Set time using API timezone (use UTC base)
        const nowUTC = new Date();
        const nowUnixUTC = Math.floor(nowUTC.getTime() / 1000);
        const { day, date, time } = formatDateTime(nowUnixUTC, timezoneOffset);
        setDay(day);
        setDateStr(date);
        setTime(time);

        console.log('Weather response (fetchData):', data);
        console.log('Forecast array:', data.Forecast);
        console.log('Hourly array:', data.Hourly);
        if (data.Forecast && data.Forecast.length) {
          console.log('Sample Forecast[0]:', data.Forecast[0]);
        }
        if (data.Hourly && data.Hourly.length) {
          console.log('Sample Hourly[0]:', data.Hourly[0]);
        }
        if (Array.isArray(data.Forecast) && data.Forecast.length) setForecast(data.Forecast);
        else setForecast(deriveDailyFromHourly(Array.isArray(data.Hourly) ? data.Hourly : []));
        if (Array.isArray(data.Hourly) && data.Hourly.length) setHourly(data.Hourly);
        else setHourly([]);
      })
      .catch(err => {
        setLoading(false);
        setForecast([]);
        setHourly([]);
        setErrorMsg("Unable to fetch weather data. Please check your internet connection or try a different location.");
        console.error(err);
      });
  }, [targetDate]);

  const fetchDataByCoords = (lat, lon, date = null) => {
    setLoading(true);
    const params = [`lat=${lat}`, `lon=${lon}`];
    if (date || targetDate) {
      const d = date || targetDate;
      params.push(`startDate=${encodeURIComponent(d)}`);
      params.push(`endDate=${encodeURIComponent(d)}`);
    }
    const url = `http://localhost:5000/loadDashboard?${params.join('&')}`;
    axios.get(url)
      .then(res => {
        setLoading(false);
        setGeoLoading(false);
        const data = res.data && res.data.WeatherData ? res.data.WeatherData : res.data;
        if (!data || data.error) {
          setErrorMsg("No weather data found for the selected location.");
          setForecast([]);
          setHourly([]);
          return;
        }
        if (data.Location && !/^Lat:|^Lon:|^[\d.-]+$/.test(data.Location)) {
          setLocation(data.Location);
          setSearchLocation(data.Location);
        } else if (data.Latitude && data.Longitude) {
          setLocation('Loading location...');
          setSearchLocation('');
          clientReverseGeocode(data.Latitude, data.Longitude).then(label => {
            if (label) {
              setLocation(label);
              setSearchLocation(label);
            } else {
              setLocation(`Lat: ${data.Latitude}, Lon: ${data.Longitude}`);
            }
          }).catch(() => setLocation(`Lat: ${data.Latitude}, Lon: ${data.Longitude}`));
        } else {
          setLocation("");
          setSearchLocation("");
        }

        const primaryHourly = Array.isArray(data.Hourly) && data.Hourly.length ? data.Hourly[0] : null;
        const primaryDaily = Array.isArray(data.Forecast) && data.Forecast.length ? data.Forecast[0] : null;
        const currTemp = primaryHourly?.temp ?? primaryDaily?.max ?? data.Temp ?? 20;
        const currFeels = primaryHourly?.feels_like ?? data.FeelsLike ?? currTemp;
        const currCloud = primaryHourly?.cloudcover ?? data.Cloud ?? 0;
        const currWind = primaryHourly?.windspeed ?? data.Wind ?? 0;
        const currWindDeg = primaryHourly?.winddir ?? data.WindDeg ?? 270;
        const currUV = primaryHourly?.uv ?? data.UV ?? 5;
        const currHumidity = primaryHourly?.humidity ?? data.Humidity ?? 70;

        setTemp(currTemp);
        setFeelsLike(currFeels);
        setCloud(currCloud);
        setWind(currWind);
        setWindDeg(currWindDeg);
        setUVIndex(currUV);
        setHumidity(currHumidity);
        setLatitude(lat);
        setLongitude(lon);
        setPressure(data.Pressure ?? 1013);
        setVisibility(data.Visibility ?? 10);
        setPrecipitation(data.Precipitation ?? 0);
        const cond = primaryHourly?.condition ?? primaryDaily?.condition ?? data.Condition ?? "";
        const code = primaryHourly?.code ?? primaryDaily?.code ?? data.Code ?? null;
        const icon = primaryHourly?.icon ?? primaryDaily?.icon ?? data.Icon ?? "";
        setWeatherDesc(cond);
        setWeatherIcon(icon);
        const useCode2 = code ?? data.Code ?? null;
        const useCond2 = cond || data.Condition || "";
        // Use new helper for dynamic background
        setBgImage(getBackground(useCond2, (WeatherIcon && WeatherIcon.endsWith('n'))));
        setDewPoint(data.DewPoint ?? null);
        setMinTemp(primaryDaily?.min ?? data.MinTemp ?? null);
        setMaxTemp(primaryDaily?.max ?? data.MaxTemp ?? null);
        setSunrise(data.Sunrise ?? "");
        setSunset(data.Sunset ?? "");
        // Use formatDateTime for current time with timezoneOffset
        const nowUnix = Math.floor(Date.now() / 1000);
        const { time } = formatDateTime(nowUnix, timezoneOffset);
        setTime(time);

        if (Array.isArray(data.Forecast) && data.Forecast.length) setForecast(data.Forecast);
        else setForecast(deriveDailyFromHourly(Array.isArray(data.Hourly) ? data.Hourly : []));
        if (Array.isArray(data.Hourly) && data.Hourly.length) setHourly(data.Hourly);
        else setHourly([]);
      })
      .catch(err => {
        setLoading(false);
        setGeoLoading(false);
        setForecast([]);
        setHourly([]);
        setErrorMsg("Unable to fetch weather data. Please check your internet connection or try a different location.");
        console.error(err);
      });
  };

  // ---------- EFFECT ON MOUNT ----------
  useEffect(() => {
    // Load profile from localStorage if available
    const storedCity = localStorage.getItem('city');
    if (storedCity && storedCity.trim()) {
      setLocation(storedCity);
      setSearchLocation(storedCity);
      fetchData(storedCity);
    } else {
      setLocation('');
      setSearchLocation('');
    }

    // Set up time updates using API timezone
    const updateTime = () => {
      // Use the latest timezoneOffset
      const nowUTC = new Date();
      const nowUnixUTC = Math.floor(nowUTC.getTime() / 1000);
      const { day, date, time } = formatDateTime(nowUnixUTC, timezoneOffset);
      setDay(day);
      setDateStr(date);
      setTime(time);
    };
    updateTime();
    const interval = setInterval(() => fetchData(), 60000);
    const timeInterval = setInterval(updateTime, 1000);
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, [fetchData, timezoneOffset]);

  // ---------- OTHER HELPERS ----------
  // getCurrentTime and getCurrentDate replaced by formatDateTime

  // Client-side reverse geocode fallback (Nominatim)
  const clientReverseGeocode = async (lat, lon) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&addressdetails=1`;
      const res = await axios.get(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'WeatherSense/1.0' } });
      if (res.data && res.data.address) {
        const a = res.data.address;
        const place = a.city || a.town || a.village || a.hamlet || a.state || a.county || a.country;
        if (place) {
          let region = a.state || a.county || '';
          let country = a.country || '';
          let label = place;
          if (region && region !== place) label += ', ' + region;
          if (country && country !== place && country !== region) label += ', ' + country;
          return label;
        }
      }
      return null;
    } catch (e) {
      console.error('Reverse geocode failed', e);
      return null;
    }
  };

  // Precompute whether hourly times look like small numeric offsets (0,1,2...)
  // (removed unused hourlyLooksLikeOffsets helper)

  // Helper: normalize time value to ISO date (YYYY-MM-DD) using timezone offset
  const timeToDateKey = (t) => {
    if (t == null) return null;
    let unix = typeof t === 'number' ? t : Date.parse(t) / 1000;
    if (!unix) return null;
    const d = new Date((unix + timezoneOffset) * 1000);
    return d.toISOString().split('T')[0];
  };

  // Derive daily forecast from hourly when daily is missing
  const deriveDailyFromHourly = (hourlyArr) => {
    if (!Array.isArray(hourlyArr) || hourlyArr.length === 0) return [];
    const buckets = {};
    for (const h of hourlyArr) {
      const key = timeToDateKey(h.time);
      if (!key) continue;
      if (!buckets[key]) buckets[key] = { temps: [], codes: [], precip: 0 };
      if (typeof h.temp === 'number') buckets[key].temps.push(h.temp);
      if (h.weathercode != null) buckets[key].codes.push(h.weathercode);
      if (typeof h.precipitation === 'number') buckets[key].precip += h.precipitation;
    }
    return Object.keys(buckets).sort().map(date => {
      const b = buckets[date];
      const min = b.temps.length ? Math.min(...b.temps) : '--';
      const max = b.temps.length ? Math.max(...b.temps) : '--';
      // pick most frequent code
      let code = null;
      if (b.codes.length) {
        const freq = {};
        for (const c of b.codes) freq[c] = (freq[c] || 0) + 1;
        code = Object.keys(freq).sort((a,b)=> freq[b]-freq[a])[0];
        code = Number(code);
      }
      return { date, min, max, precipitation: b.precip || '--', weathercode: code };
    });
  };

    // Convert humidity percentage to simple human-friendly words
    const humidityToWords = (h) => {
      if (h == null || isNaN(Number(h))) return 'Unknown humidity';
      const n = Number(h);
      if (n <= 20) return 'Very dry';
      if (n <= 40) return 'Dry';
      if (n <= 60) return 'Comfortable';
      if (n <= 75) return 'Humid';
      return 'Very humid';
    };

  // Map condition strings or weather codes to background images


  const changeTempUnit = () => {
    if (TempUnit === "C") {
      setTempUnit("F");
      setTemp((Temp * 9 / 5 + 32).toFixed(1));
      setFeelsLike((FeelsLike * 9 / 5 + 32).toFixed(1));
    } else {
      setTempUnit("C");
      setTemp(((Temp - 32) * 5 / 9).toFixed(1));
      setFeelsLike(((FeelsLike - 32) * 5 / 9).toFixed(1));
    }
  };

  const WindChange = () => {
    if (WindUnit === "mph") {
      setWindUnit("kph");
      setWind((Wind * 1.609).toFixed(1));
    } else {
      setWindUnit("mph");
      setWind((Wind / 1.609).toFixed(1));
    }
  };

  const handleLocationSearch = e => {
    e.preventDefault();
    const city = searchLocation.trim();
    if (!city) {
      setErrorMsg("Please enter a city name.");
      return;
    }
    fetchData(city);
    setShowSuggestions(false);
  };

  const handleInputChange = e => {
    const value = e.target.value;
    setSearchLocation(value);
    if (value.length > 0) {
      setSuggestions(citySuggestions.filter(c => c.toLowerCase().startsWith(value.toLowerCase())));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = city => {
    setSearchLocation(city);
    setSuggestions([]);
    setShowSuggestions(false);
    fetchData(city, targetDate);
  };

  // ---------- JSX ----------
  return (
  <div className="dash-background" style={{ overflowY: 'auto', minHeight: '100vh', position: 'relative', backgroundImage: `url('${bgImage}')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'center center', backgroundAttachment: 'fixed', backgroundSize: 'cover' }}>
      <div className="header-spacer" />
      {/* Welcome note above search bar */}
      <div style={{ width: '100%', textAlign: 'center', margin: '1em 0 0.5em 0' }}>
        <span style={{ color: '#fff', fontWeight: 900, fontSize: '2.5em', textShadow: '0 2px 8px #0006' }}>
          Welcome to WeatherSense!!
        </span>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '2em', minWidth: 340, boxShadow: '0 2px 16px rgba(0,0,0,0.18)', position: 'relative' }}>
            <button onClick={() => setShowProfile(false)} style={{ position: 'absolute', top: 12, right: 12, background: '#d9534f', color: '#fff', border: 'none', borderRadius: 6, padding: '0.3em 0.8em', fontWeight: 600, cursor: 'pointer', fontSize: '1em' }}>Close</button>
            <Profile user={user} onUpdate={setUser} onClose={() => setShowProfile(false)} />
          </div>
        </div>
      )}

      <div className="dash-section" style={{ overflowY: 'auto', maxWidth: '1100px', margin: '0 auto', minHeight: '80vh', display: 'flex', flexDirection: 'row', gap: '0' }}>
        {/* LEFT PANEL */}
        <div className="dash-left-section" style={{ minWidth: 320, maxWidth: 350, flex: '0 0 320px', padding: '2em 1.2em', alignItems: 'flex-start' }}>
            <div className="Time-Section">
              {/* Use selected day's dt/timezone for left-side date if available */}
              {(() => {
                let dayName = Day, dateStr = DateStr;
                if (forecast && forecast.length > 0 && forecast[0].dt && timezoneOffset !== undefined) {
                  const d = new Date((forecast[0].dt + timezoneOffset) * 1000);
                  dayName = d.toLocaleDateString(undefined, { weekday: 'long' });
                  dateStr = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                }
                return <>
                  <div className="Time"><FontAwesomeIcon icon={faClock} /> {Time}</div>
                  <div style={{ marginTop: 8, fontWeight: 700, color: '#fff' }}>{dayName}</div>
                  <div style={{ fontSize: '0.95rem', color: '#fff', opacity: 0.9 }}>{dateStr}</div>
                </>;
              })()}
            <div className="Location" style={{fontWeight:700, fontSize:'1.15em', color:'#fff', marginTop:8, marginBottom:2}}>
              Location: {Location && Location !== 'Unknown' ? Location : (searchLocation || 'Select a city')}
            </div>
            <div className="Coordinates" style={{fontSize:'0.95em', color:'#fff', opacity:0.85}}>
              Lat: {Latitude} | Lon: {Longitude}
            </div>
            <div className="Temperature" onClick={changeTempUnit}>{Temp}°{TempUnit}</div>
            <div className="feels-like">Feels like: {FeelsLike}°{TempUnit}</div>
          </div>
          <div className="Other-Weather-Section">
              <div className="IconBox" style={{ marginBottom: '1em', textAlign: 'center', fontSize: '2.5em' }}>
                {/* Dynamic weather icon or emoji */}
                {(() => {
                  let iconFile = iconMap[WeatherDesc] || null;
                  let icon = null;
                  if (iconFile) {
                    try {
                      icon = require(`../assets/weather-icons/${iconFile}`);
                    } catch (e) {
                      icon = null;
                    }
                  }
                  // Fallback to OWM icon code if available
                  if (!icon && WeatherIcon && WeatherIcon.length === 3 && /^[0-9]{2}[dn]$/.test(WeatherIcon)) {
                    icon = `https://openweathermap.org/img/wn/${WeatherIcon}@2x.png`;
                  }
                  return icon ? (
                    <img src={icon} alt={WeatherDesc} style={{width:'2.5em',height:'2.5em'}} />
                  ) : (
                    <span title={WeatherDesc}>{getWeatherEmoji(WeatherDesc, WeatherIcon && WeatherIcon.endsWith('n'))}</span>
                  );
                })()}
                <div style={{ fontSize: '1em', marginTop: '0.2em', color: '#fff', opacity: 0.85 }}>{WeatherDesc || 'Loading...'}</div>
              </div>
              <div className="HumidityBox"><FontAwesomeIcon icon={faTint} /> {Humidity}%</div>
              <div className="WindBox" onClick={WindChange}><FontAwesomeIcon icon={faWind} /> {Wind} {WindUnit} @ {WindDeg}°</div>
              <div className="CloudBox">Clouds: {Cloud}%</div>
              <div className="PressureBox">Pressure: {Pressure} hPa</div>
              <div className="VisibilityBox">Visibility: {Visibility} km</div>
              <div className="PrecipBox">Precipitation: {Precipitation} mm</div>
              {DewPoint !== null && <div className="DewPointBox">Dew Point: {DewPoint}°{TempUnit}</div>}
              {MinTemp !== null && <div className="MinTempBox">Min Temp: {MinTemp}°{TempUnit}</div>}
              {MaxTemp !== null && <div className="MaxTempBox">Max Temp: {MaxTemp}°{TempUnit}</div>}
              {Sunrise && <div className="SunriseBox">Sunrise: {Sunrise}</div>}
              {Sunset && <div className="SunsetBox">Sunset: {Sunset}</div>}
            </div>
        </div>
        {/* RIGHT PANEL */}
        <div
          className="dash-right-section"
          style={{
            flex: 1,
            padding: '2em 2em 2em 2em',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          "--dash-bg": `url('${bgImage}') no-repeat center center fixed`,
          "--dash-overlay": 'rgba(6,30,60,0.28)',
            backgroundSize: 'cover',
            position: 'relative'
          }}
        >
          <div className="dash-right-content" style={{ width: '100%', maxWidth: '100%', margin: 0, padding: 0 }}>
            {/* Search */}
            <form onSubmit={handleLocationSearch} className="dashboard-search-form" style={{ marginBottom: '1.2em', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{position:'relative', flex: 3, display: 'flex', alignItems: 'center'}}>
                <input
                  type="text"
                  placeholder="Search city..."
                  value={searchLocation}
                  onChange={handleInputChange}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  className="dashboard-search-input"
                  autoComplete="off"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.95)', color: '#222', border: '1px solid #1976d2', borderRadius: 8, fontSize: '1.2em', padding: '0.7em 1.2em', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <ul style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#fff',
                    color: '#222',
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    zIndex: 10,
                    maxHeight: 180,
                    overflowY: 'auto',
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                  }}>
                    {suggestions.map((city, idx) => (
                      <li
                        key={city}
                        style={{ padding: '0.5em 1em', cursor: 'pointer' }}
                        onMouseDown={() => handleSuggestionClick(city)}
                      >
                        {city}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Search button removed per UX update; use Fetch or Search Locations */}
              <button
                type="button"
                title="Search Locations"
                style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '0.45em 1em', fontWeight: 600, fontSize: '1em', cursor: 'pointer' }}
                onClick={() => setMapOpen(true)}
              >
                Search Locations
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
                <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} title="Date" style={{ padding: '0.35em', borderRadius: 6 }} />
                <button type="button" onClick={() => fetchData(searchLocation || undefined)} style={{ background: '#28a745', color: '#fff', border: 'none', borderRadius: 6, padding: '0.35em 0.75em', fontWeight: 600, cursor: 'pointer' }}>Fetch</button>
              </div>
              <button
                type="button"
                title="SearchLocation"
                style={{ marginLeft: 8, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4em 1em', fontWeight: 600, fontSize: '1em', cursor: 'pointer' }}
                disabled={geoLoading}
                onClick={() => {
                  if (navigator.geolocation) {
                    setGeoLoading(true);
                    navigator.geolocation.getCurrentPosition(
                      pos => {
                        setGeoLoading(false);
                        setLocation('Loading location...');
                        setSearchLocation('');
                        fetchDataByCoords(pos.coords.latitude, pos.coords.longitude);
                      },
                      err => {
                        setGeoLoading(false);
                        setErrorMsg('Unable to get current location. Showing Mandya weather.');
                        // Mandya coordinates: 12.5223, 76.89746
                        setLocation('Mandya, Karnataka, India');
                        setSearchLocation('Mandya, Karnataka, India');
                        setLatitude(12.5223);
                        setLongitude(76.89746);
                        fetchDataByCoords(12.5223, 76.89746);
                      }
                    );
                  } else {
                    setErrorMsg('Geolocation not supported. Showing Mandya weather.');
                    setLocation('Mandya, Karnataka, India');
                    setSearchLocation('Mandya, Karnataka, India');
                    setLatitude(12.5223);
                    setLongitude(76.89746);
                    fetchDataByCoords(12.5223, 76.89746);
                  }
                }}
              >
                <FontAwesomeIcon icon={faLocationArrow} />My Current Location
              </button>
              <MapPicker
                open={mapOpen}
                onClose={() => setMapOpen(false)}
                onPick={(lat, lng) => {
                  setMapOpen(false);
                  setGeoLoading(true);
                  setLocation('Loading location...');
                  setSearchLocation('');
                  fetchDataByCoords(lat, lng, targetDate);
                }}
              />
            </form>
            {/* Day Forecast Section, Hourly Forecast Section, Graphs, etc. */}
            <div className="forecast-section">
              {/* Day Forecast Section */}
              <div className="day-forecast-section">
                <h3 style={{marginTop:'0', marginBottom:'0.5em', textAlign:'left'}}>Day Forecast</h3>
                <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:8}}>
                  <label style={{color:'#fff'}}>Show days:</label>
                  <select value={daysToShow} onChange={e => setDaysToShow(Number(e.target.value))}>
                    <option value={3}>3</option>
                    <option value={5}>5</option>
                    <option value={7}>7</option>
                  </select>
                </div>
                <div className="forecast-cards-row" style={{overflowX:'auto', maxWidth:'100vw'}}>
                  {loading ? (
                    <div style={{color:'#fff', fontWeight:'bold'}}>
                      <FontAwesomeIcon icon={faSpinner} spin style={{marginRight:8}} /> Loading daily forecast…
                    </div>
                  ) : forecast.length > 0 ? (
                    forecast.slice(0, daysToShow).map((day, idx) => (
                      <div key={idx} style={{animation:'fadeIn 0.7s', transition:'transform 0.2s'}}>
                        <ForecastCard day={{
                          date: day.date || day.dt || '',
                          min: day.min ?? day.temp_min ?? day.tempMin ?? '--',
                          max: day.max ?? day.temp_max ?? day.tempMax ?? '--',
                          Condition: day.condition || day.Condition || (day.weather && day.weather[0] && day.weather[0].description) || day.summary || '',
                          Icon: day.icon || day.Icon || (day.weather && day.weather[0] && day.weather[0].icon) || day.image || ''
                        }} timezone_offset={timezoneOffset} />
                      </div>
                    ))
                  ) : (
                    <div style={{color:'#fff', opacity:0.7, fontSize:'1em', fontStyle:'italic'}}>
                      {errorMsg ? errorMsg : 'No daily forecast data available for this location.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Hourly Forecast Section */}
              <div className="hourly-forecast-section">
                <h3 style={{marginTop:'0', marginBottom:'0.5em', textAlign:'left'}}>Hourly Forecast</h3>
                <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:8}}>
                  <label style={{color:'#fff'}}>Show hours:</label>
                  <select value={hoursToShow} onChange={e => setHoursToShow(Number(e.target.value))}>
                    <option value={3}>3</option>
                    <option value={6}>6</option>
                    <option value={8}>8</option>
                    <option value={12}>12</option>
                  </select>
                </div>

                <div className="hourly-forecast-row">
                  {loading ? (
                    <div style={{color:'#fff', fontWeight:'bold'}}>
                      <FontAwesomeIcon icon={faSpinner} spin style={{marginRight:8}} /> Loading hourly forecast…
                    </div>
                  ) : hourly.length > 0 ? (
                    hourly.slice(0, hoursToShow).map((hour, idx) => {
                      return (
                        <HourlyForecastCard key={idx} hour={{
                          time: hour.time || hour.dt || '',
                          temp: hour.temp ?? hour.temperature ?? hour.t ?? '--',
                          Condition: hour.condition || hour.Condition || (hour.weather && hour.weather[0] && hour.weather[0].description) || hour.desc || '',
                          Icon: hour.icon || hour.Icon || (hour.weather && hour.weather[0] && hour.weather[0].icon) || hour.image || ''
                        }} timezone_offset={timezoneOffset} />
                      );
                    })
                  ) : (
                    <div style={{color:'#fff', opacity:0.7, fontSize:'1em', fontStyle:'italic'}}>
                      {errorMsg ? errorMsg : 'No hourly forecast data available for this location.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Graph + Thermometers */}
              <div className="dash-right-bottom-section">
                <div className="thermom-section-left">
                  <div className="thermom" style={{ height: `${Cloud}%` }}></div>
                </div>
                <div className="WindGraph">
                  <WindGraph val1={Humidity || 0} />
                </div>
                  {/* Humidity description shown in words, placed clearly below the graph */}
                  <div style={{ marginTop: 12, textAlign: 'center', color: '#fff', fontWeight: 600 }}>
                    Humidity: {Humidity}% — <span style={{ opacity: 0.95 }}>{humidityToWords(Humidity)}</span>
                  </div>
                <div className="thermom-section-right">
                  <div className="thermom" style={{ height: `${UVIndex / 0.11}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
