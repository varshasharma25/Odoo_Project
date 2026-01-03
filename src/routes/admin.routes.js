const express = require('express');
const Attendance = require('../models/Attendance.model');

const router = express.Router();

// Middleware: HR only
const requireHR = (req, res, next) => {
  if (req.session.role !== 'hr') {
    return res.status(403).json({ message: 'HR access required' });
  }
  next();
};

// GET /api/admin/employees - List all employees + attendance
router.get('/employees', requireHR, async (req, res) => {
  try {
    const employees = await Employee.find().populate('userId', 'employeeId name email');
    const attendances = await Attendance.find({ date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } })
      .populate('userId', 'employeeId name')
      .sort({ date: -1 });
    res.json({ employees, attendances });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/attendance - HR marks attendance
router.post('/attendance', requireHR, async (req, res) => {
  try {
    const { userId, date, status, hoursWorked } = req.body;
    const attendance = new Attendance({ userId, date, status, hoursWorked });
    await attendance.save();
    res.json({ message: 'Attendance marked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/payroll - HR sets salary
router.post('/payroll', requireHR, async (req, res) => {
  try {
    const { userId, salary, department } = req.body;
    await Employee.findOneAndUpdate(
      { userId }, 
      { salary, department, payrollStatus: 'Paid' },
      { upsert: true, new: true }
    );
    res.json({ message: 'Payroll updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
