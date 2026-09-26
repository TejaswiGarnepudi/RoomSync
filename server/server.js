const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const User = require('./models/User');
const Household = require('./models/Household');

const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const householdRoutes = require('./routes/householdRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const choreRoutes = require('./routes/choreRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const shoppingRoutes = require('./routes/shoppingRoutes');
const helpRoutes = require('./routes/helpRoutes');
const pollRoutes = require('./routes/pollRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const contributionRoutes = require('./routes/contributionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const searchRoutes = require('./routes/searchRoutes');

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
  }
});

// Socket.io JWT Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication token required'));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new Error('User not found'));
    }
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication failed'));
  }
});

// Secure Socket Connection & Room Management
io.on('connection', (socket) => {
  // Automatically join user-specific notification channel
  if (socket.user?._id) {
    socket.join(`user:${socket.user._id}`);
  }

  socket.on('join:household', async (householdId) => {
    try {
      if (!householdId) return;
      const household = await Household.findOne({ _id: householdId, members: socket.user._id });
      if (household) {
        socket.join(`household:${householdId}`);
        socket.emit('joined:household', { householdId });
      } else {
        socket.emit('error', { message: 'Unauthorized room access' });
      }
    } catch (err) {
      socket.emit('error', { message: 'Failed to join household room' });
    }
  });

  socket.on('leave:household', (householdId) => {
    if (householdId) {
      socket.leave(`household:${householdId}`);
    }
  });
});

app.set('io', io);

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/chores', choreRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/shopping', shoppingRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contribution', contributionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with Socket.io`);
});
