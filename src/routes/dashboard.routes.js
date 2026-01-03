const express = require('express');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const { role, name } = req.session;
  
  if (role === 'admin') {
    res.json({ 
      role, 
      dashboard: 'admin', 
      message: `HR Dashboard: Welcome ${name}`,
      stats: { pendingLeaves: 3, employees: 25 }
    });
  } else {
    res.json({ 
      role, 
      dashboard: 'employee', 
      message: `Employee Dashboard: Welcome ${name}`,
      today: { status: 'present', salaryNext: '15th Jan' }
    });
  }
});

module.exports = router;
