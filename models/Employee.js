const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  department: {
    type: String,
    required: [true, 'Please add a department'],
    enum: ['Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations']
  },
  position: {
    type: String,
    required: [true, 'Please add a position']
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  salary: {
    type: Number,
    required: [true, 'Please add a salary']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

EmployeeSchema.index({ 
  firstName: 'text', 
  lastName: 'text', 
  email: 'text', 
  department: 'text', 
  position: 'text' 
});

module.exports = mongoose.model('Employee', EmployeeSchema);