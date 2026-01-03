const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  myAttendance,
  adminAttendance
} = require('../controllers/attendance.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

// Employee routes (login required)
router.post('/checkin', requireAuth, checkIn);
router.post('/checkout', requireAuth, checkOut);
router.get('/my', requireAuth, myAttendance);

// Admin routes (admin only)
router.get('/admin/:employeeId', requireAuth, requireRole('admin'), adminAttendance);

module.exports = router;
