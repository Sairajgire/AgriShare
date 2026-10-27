const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  // If already connected (e.g. in serverless warm lambda or long-running server), reuse connection
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agrishare';
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    console.warn(`[MongoDB Notice] Ensure MONGO_URI in .env is configured with a valid MongoDB Atlas connection string.`);
  }
};

module.exports = connectDB;
