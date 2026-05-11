// EventFlow — Smart Event Management & Ticketing Platform
// Entry point: wires up Express, sessions, view engine, routes, and error handlers.

require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('./middleware/flashMiddleware');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

const connectDB = require('./config/database');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust the first proxy in production so secure cookies work behind HTTPS terminators
// (Cloudflare, ngrok, Render, Railway, etc.). Without this, sessions silently break on deploy.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ───── View engine ─────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// ───── Body parsing & method override ─────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// ───── Static assets ─────
app.use(express.static(path.join(__dirname, 'public')));

// ───── Sessions (stored in MongoDB) ─────
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 60 * 60 * 24 * 7 // 1 week
    }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production'
    }
  })
);

app.use(flash());

// ───── Locals available to all views ─────
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.flashMessages = {
    success: req.flash('success'),
    error: req.flash('error'),
    info: req.flash('info')
  };
  res.locals.currentPath = req.path;
  res.locals.title = 'EventFlow';
  next();
});

// ───── Routes ─────
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/bookings', bookingRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/contact', contactRoutes);
app.use('/admin', adminRoutes);

// Public home delegates to the event listing controller.
const eventController = require('./controllers/eventController');
app.get('/', eventController.listPublic);

// Convenience route to verify the global error handler renders the 500 page.
// Only available when NODE_ENV !== 'production'.
if (process.env.NODE_ENV !== 'production') {
  app.get('/__test-error', (req, res, next) => {
    next(new Error('Deliberate test error from /__test-error'));
  });
}

// ───── Error middleware (must be last) ─────
app.use(notFound);
app.use(errorHandler);

// ───── Boot ─────
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✓ EventFlow running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start EventFlow:', err);
    process.exit(1);
  }
};

start();
