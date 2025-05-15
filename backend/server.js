const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { initializeWebSocket } = require('./utils/websocket');

const app = express();
const server = http.createServer(app);

// Initialize WebSocket
initializeWebSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/fraud', require('./routes/fraudRoutes'));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/fraudshield', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('MongoDB connection error:', error);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 