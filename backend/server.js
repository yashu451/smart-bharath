const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Routes
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const documentRoutes = require('./routes/documentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const grievanceRoutes = require('./routes/grievanceRoutes');

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/grievances', grievanceRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Smart Bharat API',
    healthCheck: '/api/health',
  });
});

// Centralized error handling
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

// Establish database connection and start Express server
let serverInstance = null;

const startServer = async () => {
  if (!serverInstance) {
    serverInstance = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });

    try {
      await connectDB();
    } catch (error) {
      console.warn('[MongoDB] Initial connection notice:', error.message);
    }
  }
  return serverInstance;
};

if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;
