const express = require('express');
const authRoutes = require('./Routes/auth.routes');
const businessProfileRoutes = require('./Routes/businessProfile.routes');
const dashboardRoutes = require('./Routes/Dashboard.routes');
const cookieParser = require("cookie-parser");
const userRoutes = require('./Routes/user.routes');
const scoringRoutes = require('./Routes/scoring.routes');
const businessRoutes = require('./Routes/business.routes');
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/business-profile', businessProfileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/user',userRoutes);
app.use('/api/scoring',scoringRoutes);
app.use('/api/business',businessRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal server error";

  if (err.name === "MulterError") {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File size exceeds the 5MB limit";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      message = "Too many files uploaded. Maximum 5 documents allowed";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Too many files uploaded or unexpected field name. Please use 'documents' as key";
    }
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
});

module.exports = app;