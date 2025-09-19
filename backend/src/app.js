const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for frontend
app.use(cors({ origin: 'http://localhost:3000' }));

// Middleware to parse JSON
app.use(express.json());

// Example route
app.get('/', (req, res) => {
	res.send('API is running');
});

module.exports = app;
