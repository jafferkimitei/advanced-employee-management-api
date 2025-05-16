const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const employeeRoutes = require('./routes/employeeRoutes');
const userRoutes = require('./routes/userRoutes');
const morgan = require('morgan');
const cors = require('cors');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
const setupSecurity = require('./middleware/security');

dotenv.config();


connectDB();

const app = express();


app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
setupSecurity(app);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


app.use('/api/employees', employeeRoutes);
app.use('/api/users', userRoutes);


app.get('/', (req, res) => {
  res.send('Employee Management API is running');
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});

