const User = require('../models/User.model');

exports.register = async (req, res) => {
  const { employeeId, email, password, role, name, hrCode } = req.body;
  
  try {
    const user = new User({ employeeId, email, password, role, name });
    await user.save();
    res.json({ message: 'Registered! Login now.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Wrong email/password' });
    }
    
    req.session.userId = user._id.toString();
    req.session.role = user.role;
    req.session.name = user.name;
    
    res.json({ message: 'Login OK', role: user.role });
  } catch (err) {
    res.status(401).json({ message: 'Login failed' });
  }
};
