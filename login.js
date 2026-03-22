const { MongoClient } = require("mongodb");

const url = process.env.MONGODB_URI || "mongodb://localhost:27017/WeatherSenseDB";
const client = new MongoClient(url);

async function LoginCred(Username, Password) {
    try {
        await client.connect();

        const db = client.db('WeatherSenseDB');
        const col = db.collection('LoginAuthentication');

        const query = { 'Username': Username, 'Password': Password };
        const result = await col.findOne(query);
        if (result) {
            // Return user data for frontend
            return { success: true, user: result };
        } else {
            return { success: false };
        }
    }
    finally {
        await client.close();
    }
    
}


module.exports = { LoginCred };
