const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { syncWithMongoDB } = require('./persistentStore');

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

/**
 * Connect to MongoDB Atlas using Mongoose with auto-reconnection
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri || mongoUri.trim() === '') {
    console.error('[MongoDB] MONGODB_URI is missing or empty in backend/.env');
    return null;
  }

  const tryConnect = async () => {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`\n===============================================================`);
      console.log(`[MongoDB] Atlas Connected successfully: ${conn.connection.host}`);
      console.log(`===============================================================\n`);
      syncWithMongoDB(mongoose).catch((err) => console.warn('[MongoDB Sync]', err.message));
      return conn;
    } catch (error) {
      if (
        error.message.includes('whitelist') ||
        error.message.includes('SSL') ||
        error.message.includes('selection') ||
        error.message.includes('timed out')
      ) {
        console.error(`\n===============================================================`);
        console.error(`[MongoDB Atlas IP Whitelist Notice]`);
        console.error(`Atlas is waiting for your current IP address to be whitelisted:`);
        console.error(`1. Open MongoDB Atlas (https://cloud.mongodb.com) -> Security -> Network Access`);
        console.error(`2. Click 'Add IP Address' -> Select 'Allow Access from Anywhere' (0.0.0.0/0)`);
        console.error(`   or add your current IP address.`);
        console.error(`3. Click 'Confirm' (takes ~30s for Atlas to apply).`);
        console.error(`Server is running and will auto-connect as soon as Atlas applies.`);
        console.error(`===============================================================\n`);
      } else {
        console.error(`[MongoDB] Connection Notice: ${error.message}`);
      }
      return null;
    }
  };

  const initialConn = await tryConnect();

  // If initial connection was blocked by Atlas IP whitelist, auto-retry every 5 seconds
  if (!initialConn) {
    const retryInterval = setInterval(async () => {
      if (mongoose.connection.readyState === 1) {
        clearInterval(retryInterval);
        return;
      }
      try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
        console.log(`\n[MongoDB] Atlas Connected successfully on auto-retry!\n`);
        syncWithMongoDB(mongoose).catch((err) => console.warn('[MongoDB Sync]', err.message));
        clearInterval(retryInterval);
      } catch {
        // Keep retrying quietly until Atlas whitelists the connection
      }
    }, 5000);
  }

  return initialConn;
};

module.exports = connectDB;
