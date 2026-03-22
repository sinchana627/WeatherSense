const { MongoClient } = require("mongodb");

const url = "mongodb+srv://sinchanahs:12345@project1.rnv5lfa.mongodb.net/?retryWrites=true&w=majority&appName=PROJECT1";
const client = new MongoClient(url);

async function ActiveUsers(Username, Password) {
    try {
        await client.connect();

        const db = client.db('WeatherSenseDB');
        const col1 = db.collection('LoginAuthentication');
        const col2 = db.collection('ActiveUsers');

        const query = { 'Username': Username, 'Password': Password };
        const result = await col1.findOne(query);
        if (!result) {
            return 0;
        }
        delete result._id;
        await col2.insertOne(result);
        return 1;
    } finally {
        await client.close();
    }
}

module.exports = { ActiveUsers };