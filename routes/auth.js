const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/login', (req, res) => {
    res.render('login', { error: null, success: null });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await user.isValidPassword(password)) {
      req.session.userId = user._id;
      res.redirect('/chat');
    } else {
      res.render('login', { error: 'Invalid credentials', success: null });
    }
});

router.get('/register', (req, res) => {
    res.render('register', { error: null, success: null });
});

router.post('/register', async (req, res) => {
  const { username, fullname, password } = req.body;
  try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
          return res.render('register', { error: `This user name ${username} is already registered!`, success: null });
      }
        const user = new User({ username, fullname, password });
        await user.save();
      res.render('register', { success: 'Account created successfully!', error: null });
    } catch(err) {
      res.render('register', { error: 'Registration failed.', success: null });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect('/login');
    });
});

module.exports = router;
