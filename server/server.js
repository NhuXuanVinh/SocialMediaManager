const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');
const cors = require('cors');
// Routes import
const authRoutes = require('./routes/authRoutes');
const twitterRoutes = require('./routes/twitterRoutes')
const groupRoutes = require('./routes/groupRoutes')
const accountRoutes = require('./routes/accountRoutes')
const linkedinRoutes = require('./routes/linkedinRoutes')
const facebookRoutes = require('./routes/facebookRoutes')
const postRoutes = require('./routes/postRoutes')
const tagRoutes = require('./routes/tagRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const instagramRoutes = require('./routes/instagramRoutes');
// Model
const { sequelize } = require('./models');

const startInsightsScheduler = require('./jobs/insightsScheduler');

dotenv.config();
connectDB();
startInsightsScheduler();
const app = express();
app.use(cookieParser());
app.use(session({
  secret: '12345', // A random secret to sign the session ID
  resave: false,             // Don't save session if it's not modified
  saveUninitialized: true,   // Save an uninitialized session
  cookie: {     
    secure: false, // Set to true if using HTTPS
    sameSite: 'lax', }  // If using HTTPS, set `secure: true`
}));
app.use(cors({ origin: process.env.CLIENT_APP_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json()); // To parse JSON request bodies
// Routes
app.use('/api/auth', authRoutes);
app.use('/api', twitterRoutes)
app.use('/api', groupRoutes)
app.use('/api', accountRoutes)
app.use('/api', facebookRoutes)
app.use('/api', linkedinRoutes)
app.use('/api', instagramRoutes)
app.use('/api', postRoutes)
app.use('/api/', tagRoutes)
app.use('/api', workspaceRoutes)
app.use('/api', analyticsRoutes);

// Sync models and start the server
sequelize.sync({force: false, alter: true})
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('Error syncing database:', err));
