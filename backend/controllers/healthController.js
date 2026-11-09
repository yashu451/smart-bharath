/**
 * @desc    Check health status of the backend server
 * @route   GET /api/health
 * @access  Public
 */
const getHealthStatus = (req, res) => {
  res.status(200).json({
    status: 'ok',
    success: true,
    message: 'Smart Bharat backend server is running',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)}s`,
    environment: process.env.NODE_ENV || 'development'
  });
};

module.exports = {
  getHealthStatus,
};

