const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
require('dotenv').config();
const path = require('path');


const User = require('./models/User');
const Employee = require('./models/Employee');


const rawData = fs.readFileSync(
  path.resolve(__dirname, './employeeData.json'),
  'utf8'
);
const data = JSON.parse(rawData);


const DB_PASSWORD = process.env.DB_PASSWORD || 'x2mcTq39DBhshKo6';
const MONGO_URI = process.env.MONGO_URI || 
  `mongodb+srv://yunghavy:${DB_PASSWORD}@randomprojects.8xm4jvh.mongodb.net/employee-management?retryWrites=true&w=majority&appName=RandomProjects`;


mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;


db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB database');
  seedDatabase();
});


const generateHashedPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};


const seedDatabase = async () => {
  try {

    await User.deleteMany({});
    await Employee.deleteMany({});
    
    console.log('Previous data cleared');
    

    const usersWithHashedPasswords = await Promise.all(
      data.users.map(async (user) => {
        const hashedPassword = await generateHashedPassword(user.password);
        return {
          ...user,
          password: hashedPassword
        };
      })
    );
    
    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`${createdUsers.length} users created successfully`);
    
 
    const userMap = {};
    createdUsers.forEach(user => {
      userMap[user.email] = user._id;
    });
    
 
    const employeesWithUsers = data.employees.map((employee, index) => {
      let assignedUser;
      

      if (employee.department === 'Engineering') {
        assignedUser = userMap[data.users.find(u => u.role === 'manager')?.email];
      } else if (employee.department === 'HR') {
        assignedUser = userMap[data.users.find(u => u.role === 'admin')?.email];
      } else if (employee.department === 'Finance') {
        assignedUser = userMap[data.users.find(u => u.name === 'Lisa Brown')?.email];
      } else if (employee.department === 'Marketing') {
        assignedUser = userMap[data.users.find(u => u.name === 'David Wilson')?.email];
      } else if (employee.department === 'Sales') {
        assignedUser = userMap[data.users.find(u => u.name === 'Sarah Johnson')?.email];
      } else if (employee.department === 'Operations') {
        assignedUser = userMap[data.users.find(u => u.name === 'Amanda Martinez')?.email];
      }
      

      if (!assignedUser) {
        const userEmails = Object.keys(userMap);
        assignedUser = userMap[userEmails[index % userEmails.length]];
      }
      
      return {
        ...employee,
        user: assignedUser
      };
    });
    

    const createdEmployees = await Employee.insertMany(employeesWithUsers);
    console.log(`${createdEmployees.length} employees created successfully`);
    
    console.log('Database seeded successfully');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.disconnect();
    console.log('Database connection closed');
  }
};


process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
  });
});