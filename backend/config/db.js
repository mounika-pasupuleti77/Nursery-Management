const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/annadata_nursery';
  try {
    // Try standard MongoDB connection
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log('Local MongoDB connection failed or not running. Initializing MongoMemoryServer...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`MongoMemoryServer Connected: ${conn.connection.host}`);
    } catch (memError) {
      console.error(`Database Connection Error: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
