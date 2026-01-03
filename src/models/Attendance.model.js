const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  employeeId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  checkIn: {
    type: Date
  },
  checkOut: {
    type: Date
  },
  hoursWorked: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Half-Day', 'Holiday'],
    default: 'Absent'
  },
  notes: String // HR notes
}, {
  timestamps: true
});

// Index for fast queries
attendanceSchema.index({ userId: 1, date: 1 });
attendanceSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
