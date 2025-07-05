import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/database.js';
import { initializeFirebase } from './config/firebase.js';
import { testEmailConfig } from './config/email.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import adminRoutes from './routes/admin.js';
import { errorHandler } from './middleware/errorHandler.js';
import { auditLogger } from './middleware/auditLogger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));



app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


app.use(morgan('combined'));


app.use(auditLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);


app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      email: process.env.SMTP_USER ? 'configured' : 'not-configured'
    }
  });
});


app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB(); 
    initializeFirebase(); 
    const emailTest = await testEmailConfig(); 

    if (emailTest.success) {
      console.log('Email service is configured and ready');
    } else {
      console.log('Email service not configured - emails will not be sent');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  } catch (err) {
    console.error('Error during initialization:', err);
    process.exit(1); 
  }
};

startServer();
