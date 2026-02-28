const express = require('express');
const { connectDB } = require('./config/db');
const cors = require('cors');
const errorLogger = require('./middleware/errorLogger'); // Import
require('dotenv').config();

const app = express();

connectDB();

app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/interview', require('./routes/interview.routes'));

// REGISTER SILENT KILLER (Must be last)
app.use(errorLogger);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));