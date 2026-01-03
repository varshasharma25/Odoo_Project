const express = require('express');
const Attendance = require('../models/Attendance.model');
const Employee = require('../models/Employee.model');
const router = express.Router();

// GET /api/employees/me - My profile + salary
router.get('/me', async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.session.userId });
    res.json({ salary: employee?.salary || 0, payrollStatus: employee?.payrollStatus || 'Pending' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/employees/attendance - My attendance
router.get('/attendance', async (req, res) => {
  try {
    const attendance = await Attendance.find({ 
      userId: req.session.userId,
      date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    }).sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
