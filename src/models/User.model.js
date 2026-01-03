const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  employeeId: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['employee', 'hr'] },
  name: String
});

module.exports = mongoose.model('User', userSchema);
