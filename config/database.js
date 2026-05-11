const mongoose = require('mongoose');

// Connect to MongoDB. Fails fast in development so misconfiguration is obvious.
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined. Copy .env.example to .env and set it.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`✓ MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
};

module.exports = connectDB;
