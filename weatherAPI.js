const axios = require('axios');

// Get lat/lon from city name using Open-Meteo geocoding
async function getLatLon(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const res = await axios.get(url);
    if (res.data && Array.isArray(res.data.results) && res.data.results.length > 0) {
        const r = res.data.results[0];
        const latitude = r.latitude;
        const longitude = r.longitude;
        const name = r.name || '';
        const country = r.country || '';
        const admin1 = r.admin1 || '';
        const location = `${name}${admin1 ? ', ' + admin1 : ''}${country ? ', ' + country : ''}`.trim();
        return { latitude, longitude, location };
    }
    throw new Error('City not found');
}

// Reverse geocode lat/lon (fallback to simple label on failure)
async function reverseGeocode(lat, lon) {
    try {
        const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1`;
        const res = await axios.get(url);
        if (res.data && Array.isArray(res.data.results) && res.data.results.length > 0) {
            const r = res.data.results[0];
            const name = r.name || '';
            const country = r.country || '';
            const admin1 = r.admin1 || '';
            if (name || country) return `${name}${admin1 ? ', ' + admin1 : ''}${country ? ', ' + country : ''}`.trim();
        }
    } catch (e) {
        // ignore and fallback
    }
    return `Lat: ${lat}, Lon: ${lon}`;
}

function getWeatherConditionAndIcon(code) {
    const map = {
        0: { condition: 'Clear sky', icon: 'clear-day' },
        1: { condition: 'Mainly clear', icon: 'mainly-clear-day' },
        2: { condition: 'Partly cloudy', icon: 'partly-cloudy-day' },
        3: { condition: 'Overcast', icon: 'cloudy' },
        45: { condition: 'Fog', icon: 'fog' },
        48: { condition: 'Depositing rime fog', icon: 'fog' },
        51: { condition: 'Light drizzle', icon: 'drizzle' },
        53: { condition: 'Drizzle', icon: 'drizzle' },
        55: { condition: 'Dense drizzle', icon: 'drizzle' },
        56: { condition: 'Freezing drizzle', icon: 'drizzle' },
        57: { condition: 'Freezing drizzle', icon: 'drizzle' },
        61: { condition: 'Slight rain', icon: 'rain' },
        63: { condition: 'Rain', icon: 'rain' },
        65: { condition: 'Heavy rain', icon: 'rain' },
        66: { condition: 'Freezing rain', icon: 'rain' },
        67: { condition: 'Freezing rain', icon: 'rain' },
        71: { condition: 'Slight snow fall', icon: 'snow' },
        73: { condition: 'Snow fall', icon: 'snow' },
        75: { condition: 'Heavy snow fall', icon: 'snow' },
        77: { condition: 'Snow grains', icon: 'snow' },
        80: { condition: 'Slight rain showers', icon: 'showers' },
        81: { condition: 'Rain showers', icon: 'showers' },
        82: { condition: 'Violent rain showers', icon: 'showers' },
        85: { condition: 'Slight snow showers', icon: 'snow-showers' },
        86: { condition: 'Heavy snow showers', icon: 'snow-showers' },
        95: { condition: 'Thunderstorm', icon: 'thunderstorms' },
        96: { condition: 'Thunderstorm with hail', icon: 'thunderstorms' },
        99: { condition: 'Thunderstorm with hail', icon: 'thunderstorms' },
    };
    const entry = map[Number(code)];
    if (entry) return { condition: entry.condition, icon: `https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/svg/${entry.icon}.svg` };
    return { condition: 'Unknown', icon: 'https://cdn-icons-png.flaticon.com/512/10127/10127236.png' };
}

function safeAt(arr, idx) {
    if (!Array.isArray(arr)) return null;
    return (idx >= 0 && idx < arr.length) ? arr[idx] : null;
}

async function FetchAPIdata(query, startDate, endDate) {
    try {
        let latitude, longitude, location;
        if (typeof query === 'string' && query.includes(',')) {
            const [lat, lon] = query.split(',').map(s => Number(s.trim()));
            latitude = lat;
            longitude = lon;
            location = await reverseGeocode(lat, lon);
        } else {
            const geo = await getLatLon(query || 'Bengaluru');
            latitude = geo.latitude;
            longitude = geo.longitude;
            location = geo.location;
        }

        let url;
        // Decide whether to use archive (past dates) or forecast (today/future)
        if (startDate || endDate) {
            const s = startDate || new Date().toISOString().split('T')[0];
            const e = endDate || s;
            // parse dates (YYYY-MM-DD expected)
            const sDate = new Date(s + 'T00:00:00Z');
            const eDate = new Date(e + 'T00:00:00Z');
            const today = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00Z');
            // If both requested dates are strictly before today, use ERA5 archive
            if (eDate < today) {
                url = `https://archive-api.open-meteo.com/v1/era5?latitude=${latitude}&longitude=${longitude}&start_date=${s}&end_date=${e}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weathercode,cloudcover,pressure_msl,visibility,winddirection_10m,windspeed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,uv_index_max&timezone=auto`;
            } else {
                // If any part of the requested range includes today or future, use forecast API
                // Forecast API supports current_weather and daily/hourly variables; include start_date/end_date to help limit the returned range
                url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&start_date=${s}&end_date=${e}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weathercode,cloudcover,pressure_msl,visibility,winddirection_10m,windspeed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,uv_index_max&timezone=auto`;
            }
        } else {
            url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weathercode,cloudcover,pressure_msl,visibility,winddirection_10m,windspeed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,uv_index_max&forecast_days=7&timezone=auto`;
        }

        const res = await axios.get(url);
        const d = res.data || {};
        const current = d.current_weather || {};
        const daily = d.daily || {};
        const hourly = d.hourly || {};
        // Debug log for API response
        console.log('Open-Meteo API daily:', JSON.stringify(daily));
        console.log('Open-Meteo API hourly:', JSON.stringify(hourly));

        const times = Array.isArray(hourly.time) ? hourly.time : [];
        const Hourly = times.map((t, i) => {
            const code = safeAt(hourly.weathercode, i);
            const info = getWeatherConditionAndIcon(code);
            return {
                time: t,
                temp: safeAt(hourly.temperature_2m, i),
                humidity: safeAt(hourly.relative_humidity_2m, i),
                apparent: safeAt(hourly.apparent_temperature, i),
                precipitation: safeAt(hourly.precipitation, i),
                weathercode: code,
                cloudcover: safeAt(hourly.cloudcover, i),
                pressure: safeAt(hourly.pressure_msl, i),
                visibility: safeAt(hourly.visibility, i),
                winddir: safeAt(hourly.winddirection_10m, i),
                windspeed: safeAt(hourly.windspeed_10m, i),
                uv: safeAt(hourly.uv_index, i),
                Condition: info.condition,
                Icon: info.icon,
            };
        });

        const dTimes = Array.isArray(daily.time) ? daily.time : [];
        const Forecast = dTimes.map((t, i) => {
            const code = safeAt(daily.weathercode, i);
            const info = getWeatherConditionAndIcon(code);
            return {
                date: t,
                min: safeAt(daily.temperature_2m_min, i),
                max: safeAt(daily.temperature_2m_max, i),
                precipitation: safeAt(daily.precipitation_sum, i),
                weathercode: code,
                uv: safeAt(daily.uv_index_max, i),
                Condition: info.condition,
                Icon: info.icon,
            };
        });

        const weatherCode = (current && typeof current.weathercode !== 'undefined') ?
            current.weathercode :
            (Hourly[0] && typeof Hourly[0].weathercode !== 'undefined') ? Hourly[0].weathercode :
            (Forecast[0] && typeof Forecast[0].weathercode !== 'undefined') ? Forecast[0].weathercode :
            0;

        const { condition, icon } = getWeatherConditionAndIcon(weatherCode);

        const WeatherData = {
            Location: location,
            Temp: (typeof current.temperature !== 'undefined') ? current.temperature : (Hourly[0] ? Hourly[0].temp : null),
            FeelsLike: (Hourly[0] ? Hourly[0].apparent : null),
            Cloud: (Hourly[0] ? Hourly[0].cloudcover : null),
            Wind: (typeof current.windspeed !== 'undefined') ? current.windspeed : (Hourly[0] ? Hourly[0].windspeed : null),
            WindDeg: (typeof current.winddirection !== 'undefined') ? current.winddirection : (Hourly[0] ? Hourly[0].winddir : null),
            UV: (Hourly[0] ? Hourly[0].uv : null),
            Humidity: (Hourly[0] ? Hourly[0].humidity : null),
            Latitude: latitude,
            Longitude: longitude,
            Pressure: (Hourly[0] ? Hourly[0].pressure : null),
            Visibility: (Hourly[0] ? Hourly[0].visibility : null),
            Precipitation: (Hourly[0] ? Hourly[0].precipitation : null),
            Condition: condition,
            Icon: icon,
            Forecast,
            Hourly,
        };

        return { WeatherData };
    } catch (error) {
        console.error('Open-Meteo API error:', error && error.message ? error.message : error);
        return { error: (error && error.message) ? error.message : 'Unknown error' };
    }
}

module.exports = { FetchAPIdata };