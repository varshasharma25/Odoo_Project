const User = require('../models/User.model');

exports.register = async (req, res) => {
  try {
    const { employeeId, email, password, role, name } = req.body;

    // Basic validation
    if (!employeeId || !email || !password || !name) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const user = new User({ employeeId, email, password, role, name });
    await user.save();

    res.status(201).json({ 
      message: 'User created', 
      userId: user._id,
      role: user.role 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Simple session token (JWT later)
    req.session.userId = user._id;
    req.session.role = user.role;
    req.session.name = user.name;

    res.json({ 
      message: 'Login successful', 
      role: user.role, 
      name: user.name 
    });

  } catch (err) {  // ← This catch block was missing
    res.status(500).json({ message: 'Server error' });
  }
};
