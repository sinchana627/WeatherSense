const { MongoClient } = require("mongodb");

const url = "mongodb+srv://sinchanahs:12345@project1.rnv5lfa.mongodb.net/?retryWrites=true&w=majority&appName=PROJECT1";

async function ActiveUserDetails() {
    let client;
    try {
        client = new MongoClient(url);
        await client.connect();

        const db = client.db('WeatherSenseDB');
        const col = db.collection('ActiveUsers');

        const results = await col.find({}).toArray();
        const lastUser = results.length > 0 ? results[results.length - 1] : null;
        if (lastUser && lastUser._id) {
            delete lastUser._id;
        }
        return lastUser;
    } catch (error) {
        console.error('Error retrieving active user details:', error);
        return null;
    } finally {
        if (client) await client.close();
    }
}

module.exports = { ActiveUserDetails };