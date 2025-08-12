const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
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
// Model
const { sequelize } = require('./models');


dotenv.config();
connectDB();

const app = express();

app.use(session({
  secret: '12345', // A random secret to sign the session ID
  resave: false,             // Don't save session if it's not modified
  saveUninitialized: true,   // Save an uninitialized session
  cookie: {     
    secure: false, // Set to true if using HTTPS
    sameSite: 'lax', }  // If using HTTPS, set `secure: true`
}));
app.use(cors());
app.use(express.json()); // To parse JSON request bodies
// Routes
app.use('/api/auth', authRoutes);
app.use('/api', twitterRoutes)
app.use('/api/groups', groupRoutes)
app.use('/api/account', accountRoutes)
app.use('/api', facebookRoutes)
app.use('/api', linkedinRoutes)
app.use('/api', postRoutes)
// Sync models and start the server
sequelize.sync({force: false, alter: true})
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('Error syncing database:', err));
