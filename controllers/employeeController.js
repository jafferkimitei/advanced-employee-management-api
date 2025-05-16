const Employee = require('../models/Employee');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
exports.getEmployees = asyncHandler(async (req, res, next) => {
  try {
    
    let query;
    
    
    const reqQuery = { ...req.query };
    
    
    const removeFields = ['select', 'sort', 'page', 'limit'];
    
    
    removeFields.forEach(param => delete reqQuery[param]);
    
    
    let queryStr = JSON.stringify(reqQuery);
    
    
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `${match}`);
    
    
    query = Employee.find(JSON.parse(queryStr));
    
   
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Employee.countDocuments(JSON.parse(queryStr));
    
    query = query.skip(startIndex).limit(limit);
    
    
    const employees = await query;
    
    
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: employees.length,
      pagination,
      data: employees
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Search employees
// @route   GET /api/employees/search
// @access  Private
exports.searchEmployees = asyncHandler(async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a search query'
      });
    }
    
   
    
    const employees = await Employee.find(
      { 
        $or: [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { department: { $regex: query, $options: 'i' } },
          { position: { $regex: query, $options: 'i' } }
        ]
      }
    );
    
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployee = asyncHandler(async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin/Manager only)
exports.createEmployee = asyncHandler(async (req, res, next) => {
  try {
    
    req.body.user = req.user.id;
    
    const employee = await Employee.create(req.body);
    
    res.status(201).json({
      success: true,
      data: employee
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin/Manager only)
exports.updateEmployee = asyncHandler(async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin only)
exports.deleteEmployee = asyncHandler(async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }
    
    await employee.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
});