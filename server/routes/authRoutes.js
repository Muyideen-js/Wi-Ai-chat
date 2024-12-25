const express = require('express');
const router = express.Router();

// Import the controller functions directly
const { signup, login } = require('../controllers/authController');

// Define routes with the imported functions
router.post('/signup', signup);
router.post('/login', login);

module.exports = router; 