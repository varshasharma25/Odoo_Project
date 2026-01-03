const Attendance = require('../models/Attendance.model');

// Helper: normalize a date to start-of-day (00:00:00.000)
function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// Helper: end-of-day (23:59:59.999)
function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

// POST /api/attendance/checkin
exports.checkIn = async (req, res) => {
  try {
    const userId = req.session.userId;

    const todayStart = startOfDay(new Date());

    // if record exists and already checked in => block
    const existing = await Attendance.findOne({ userId, date: todayStart });
    if (existing && existing.checkIn) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const updated = await Attendance.findOneAndUpdate(
      { userId, date: todayStart },
      {
        $set: {
          checkIn: new Date(),
          status: 'present',
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Checked in', attendance: updated });
  } catch (err) {
    console.error('checkIn error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/attendance/checkout
exports.checkOut = async (req, res) => {
  try {
    const userId = req.session.userId;

    const todayStart = startOfDay(new Date());

    const record = await Attendance.findOne({ userId, date: todayStart });

    if (!record || !record.checkIn) {
      return res.status(400).json({ message: 'You must check-in first' });
    }

    if (record.checkOut) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    record.checkOut = new Date();

    // Optional: if checkout is too early, mark half-day (simple rule)
    const workedMs = record.checkOut - record.checkIn;
    const workedHours = workedMs / (1000 * 60 * 60);
    if (workedHours < 4) {
      record.status = 'half-day';
    } else {
      record.status = 'present';
    }

    await record.save();

    res.status(200).json({ message: 'Checked out', attendance: record });
  } catch (err) {
    console.error('checkOut error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/attendance/my?from=YYYY-MM-DD&to=YYYY-MM-DD
exports.myAttendance = async (req, res) => {
  try {
    const userId = req.session.userId;

    const { from, to } = req.query;

    // Default: last 7 days
    const fromDate = from ? startOfDay(new Date(from)) : startOfDay(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));
    const toDate = to ? endOfDay(new Date(to)) : endOfDay(new Date());

    const records = await Attendance.find({
      userId,
      date: { $gte: fromDate, $lte: toDate },
    }).sort({ date: 1 });

    res.status(200).json({ from: fromDate, to: toDate, records });
  } catch (err) {
    console.error('myAttendance error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/attendance?employeeId=EMP001&from=YYYY-MM-DD&to=YYYY-MM-DD
// (admin route should be protected by requireRole('admin'))
exports.adminAttendance = async (req, res) => {
  try {
    const { employeeId, from, to } = req.query;

    if (!employeeId) {
      return res.status(400).json({ message: 'employeeId is required' });
    }

    // NOTE: easiest approach: your admin route can first find user by employeeId,
    // then query attendance by userId. We'll do that in admin controller later.
    // For now, just return a placeholder so you can wire the endpoint.
    res.status(200).json({
      message: 'Admin attendance endpoint wired. Next: map employeeId -> userId.',
      employeeId,
      from: from || null,
      to: to || null,
    });
  } catch (err) {
    console.error('adminAttendance error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
