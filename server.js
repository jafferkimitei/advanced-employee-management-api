const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const employeeRoutes = require('./routes/employeeRoutes');
const userRoutes = require('./routes/userRoutes');
const morgan = require('morgan');
const cors = require('cors');
const errorHandler = require('./middleware/error');


dotenv.config();


connectDB();

const app = express();


app.use(express.json());


app.use(cors());


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
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});


process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);

  server.close(() => process.exit(1));
});