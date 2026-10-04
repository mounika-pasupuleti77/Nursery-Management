const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
const User = require('./models/User');
const seedData = require('./utils/seedData');

dotenv.config();

const app = express();

// Production CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      } else {
        return callback(new Error('CORS Policy: Origin not allowed'));
      }
    },
    credentials: true
  })
);

app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Health Check Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'ANNADATA NURSERY API', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.send('ANNADATA NURSERY API Service is active.');
});

// Centralized Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // Auto-seed if database is empty
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database empty. Running initial seed...');
      await seedData();
    }
  } catch (seedErr) {
    console.error('Auto-seed check note:', seedErr.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
