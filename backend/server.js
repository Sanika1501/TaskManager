require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// ---- Validate required environment variables ----
const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// ---- CORS ----
// CLIENT_URL can be a single URL or a comma-separated list of URLs
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (Postman, curl) that send no Origin header
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ---- Body parsing ----
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ---- Routes ----
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// ---- Error handling (must be last) ----
app.use(notFound);
app.use(errorHandler);

// ---- Start server after DB connects ----
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled rejection: ${err.message}`);
  process.exit(1);
});
