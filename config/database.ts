const mongoose = require('mongoose');

async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
        console.log('Connected to Database');
    } catch (error) {
        console.error('Database connection error:', error);
    }
}

module.exports = connectToDatabase;