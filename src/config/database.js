require('dotenv').config();
const mongoose = require('mongoose');

const dbState = [
    {
        value: 0,
        label: 'Disconnected',
    },
    {
        value: 1,
        label: 'Connected',
    },
    {
        value: 2,
        label: 'Connecting',
    },
    {
        value: 3,
        label: 'Disconnecting',
    },
    {
        value: 99,
        label: 'Invalid',
    }
]

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const state = mongoose.connection.readyState;
        console.log(`MongoDB ${dbState.find(item => item.value === state).label}`);
        mongoose.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error.message);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1); // Exit process with failure
    }
}

module.exports = {connectDB};