const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // If no MONGO_URI is provided yet (e.g. hackathon demoing locally before cloud setup)
    // we can fallback to a local instance, but user will provide via .env
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/healthbridge';
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
