require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const session = require('express-session');
const sequelize = require('./config/database');
require('./models/Task');
require('./models/User');
const passport = require('./config/passport');
const taskRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth');

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error' });
});

sequelize.sync().then(() => {
  app.listen(process.env.PORT || 3000, () => console.log('API running'));
});