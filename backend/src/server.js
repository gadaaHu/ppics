import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import eventsRoutes from './routes/eventsRoutes.js';
import hierarchyRoutes from './routes/hierarchyRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import planRoutes from './routes/planRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import districtRoutes from './routes/districtRoutes.js';
import cooperativeRoutes from './routes/cooperativeRoutes.js';
import familyRoutes from './routes/familyRoutes.js';
import positionRoutes from './routes/positionRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import documentRoutes from './routes/documentRoutes.js'; // ✅ Added
import memberProfileRoutes from './routes/memberProfileRoutes.js';
import publicationRoutes from './routes/publicationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import evaluationRoutes from './routes/evaluationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import eLearningRoutes from './routes/eLearningRoutes.js';





dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://ppics.mecrvs.gov.et',
  'https://ppics.mecrvs.gov.et',
  'http://icspp.mecrvs.gov.et',
  'https://icspp.mecrvs.gov.et'
];
if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads folder
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/hierarchy', hierarchyRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/cooperatives', cooperativeRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/documents', documentRoutes); // ✅ Added document routes
app.use('/api/member', memberProfileRoutes);

app.use('/api/publications', publicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/e-learning', eLearningRoutes);




// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test database route
app.get('/api/test-db', async (req, res) => {
  try {
    const { query } = await import('./config/database.js');
    const users = await query('SELECT COUNT(*) as count FROM users');
    res.json({ 
      success: true, 
      message: 'Database connected',
      userCount: users[0].count
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await testConnection();
});