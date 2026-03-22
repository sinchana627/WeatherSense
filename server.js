const express = require('express');
const profileRouter = require('./profile');
const app = express();
const port = 5000;
const cors = require('cors');
const path = require('path');

const { LoginCred } = require('./login');
const { RegisterCred } = require('./register');
const { ActiveUsers } = require('./dashboard');
const { ActiveUserDetails } = require('./activeUser');
const { FetchAPIdata } = require('./weatherAPI');

app.use(cors());
app.use(express.json());
app.use('/profile_photos', express.static(path.join(__dirname, '../client/public/profile_photos')));
app.use('/api/profile', profileRouter);

app.post('/loginCredentials', async(req, res) => {
    const { Username, Password } = req.body;
    const result = await LoginCred(Username, Password);
    if (result.success) res.json({ success: true, user: result.user });
    else res.json({ success: false });
});

app.post('/registerCredentials', async(req, res) => {
    const { Username, Password, Name, City } = req.body;
    const result = await RegisterCred(Username, Password, Name, City);
    if (result === 1) res.send('exists');
    else if (result === 2) res.send('created');
    else res.send('unsuccessful');
});

app.get('/loadDashboard', async(req, res) => {
    try {
        let city = req.query.city;
        let lat = req.query.lat;
        let lon = req.query.lon;
        let startDate = req.query.startDate;
        let endDate = req.query.endDate;
        let query = null;

        if (lat && lon) query = `${lat},${lon}`;
        else if (city) query = city;
        else {
            const result = await ActiveUserDetails();
            if (!result || !result.City) query = "Bengaluru"; // fallback default city
            else query = result.City;
        }

        const result = await FetchAPIdata(query, startDate, endDate);
        if (result.error) return res.status(502).json({ error: result.error });

        // result currently is { WeatherData: { ... } }
        // for compatibility return both the wrapper and the same fields at top-level
        const payload = result.WeatherData || {};
        const combined = Object.assign({ WeatherData: payload }, payload);
        res.json(combined);
    } catch (err) {
        console.error('Error in /loadDashboard:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/activeUsers', async(req, res) => {
    const { Username, Password } = req.body;
    const result = await ActiveUsers(Username, Password);
    if (result === 1) res.send('added');
    else res.send('not added');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});