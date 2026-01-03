const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const connectDB = require('./src/config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session must be BEFORE routes that use req.session
app.use(session({
  secret: 'dayflow-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// (Optional) log session for every request
app.use((req, res, next) => {
  console.log('Session:', req.session);
  next();
});

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));
app.use('/api/dashboard', require('./src/routes/dashboard.routes'));
app.use('/api/attendance', require('./src/routes/attendance.routes'));


// Static files
app.use(express.static(path.join(__dirname, 'src', 'public')));

app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
