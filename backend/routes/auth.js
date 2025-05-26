const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path as necessary
const router = express.Router();

// Input validation utility (basic)
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }
    if (username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters long.' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // 2. Check if user already exists
    const existingUserByUsername = await User.findOne({ where: { username } });
    if (existingUserByUsername) {
      return res.status(409).json({ message: 'Username already exists.' });
    }
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 4. Create new user
    const newUser = await User.create({
      username,
      email,
      password_hash
    });

    // 5. Return success (excluding password)
    // Note: newUser is a Sequelize instance, use .toJSON() to get plain object
    const userResponse = newUser.toJSON();
    delete userResponse.password_hash; // Ensure password hash is not sent

    res.status(201).json({ message: 'User registered successfully.', user: userResponse });

  } catch (error) {
    console.error('Registration error:', error);
    // Check for Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors: messages });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    if (!validateEmail(email)) { // Re-use email validation
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    // 2. Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Password incorrect.' });
    }

    // 4. Generate JWT
    // IMPORTANT: Use a strong, secret key and store it in environment variables
    const jwtSecret = process.env.JWT_SECRET || 'YOUR_VERY_SECRET_KEY_REPLACE_IN_PROD';
    if (jwtSecret === 'YOUR_VERY_SECRET_KEY_REPLACE_IN_PROD') {
        console.warn('Warning: Using default JWT_SECRET. Please set a strong secret in your environment variables for production.');
    }

    const payload = {
      user: {
        id: user.id,
        username: user.username
        // Add other user details if needed, but keep payload small
      }
    };

    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: '1h' }, // Token expiration (e.g., 1 hour, 1d for one day)
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } }); // Send token and some user info
      }
    );

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;
