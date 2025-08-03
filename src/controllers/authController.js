// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Mentor = require('../models/mentorModel');
const Intern = require('../models/internModel');

// --- Register Function ---
exports.registerMentor = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await Mentor.create(name, email, hashedPassword, role);
    res.status(201).json({ message: 'Mentor registered successfully!' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists.' });
    }
    console.error('Error registering mentor:', error);
    res.status(500).json({ message: 'Server error while registering mentor.' });
  }
};

// --- Login Function ---

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    let user;
    let userType;

    // First, try to find a user in the mentors table
    const [mentors] = await Mentor.findByEmail(email);
    if (mentors.length > 0) {
      user = mentors[0];
      userType = 'mentor';
    } else {
      // If not found, try to find a user in the interns table
      const [interns] = await Intern.findByEmail(email);
      if (interns.length > 0) {
        user = interns[0];
        userType = 'intern';
      }
    }

    // If user is not found in either table
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Passwords match, create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role || userType
      }
    };

    // Sign the token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// --- Get Logged-in User Function ---
exports.getLoggedInUser = async (req, res) => {
  try {
    // req.user is attached by the authMiddleware
    res.json(req.user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};