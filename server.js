const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'src', 'public')));

// Auth
app.use('/api/auth', require('./src/routes/auth.routes'));

// Employees
//app.use('/api/employees', require('./src/routes/employee.routes'));

// Admin
//app.use('/api/admin', require('./src/routes/admin.routes'));

const session = require('express-session');
app.use(session({
  secret: 'dayflow-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true in production
}));

app.use('/api/dashboard', require('./src/routes/dashboard.routes'));
app.use((req, res, next) => {
  console.log('Session:', req.session);
  next();
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
