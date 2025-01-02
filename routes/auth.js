// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await user.isValidPassword(password)) {
      req.session.userId = user._id;
      res.redirect('/chat');
    } else {
      res.render('login', { error: 'Invalid credentials' });
    }
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    const { username, fullname, password } = req.body;
    try {
      const user = new User({ username, fullname, password });
      await user.save();
      req.session.userId = user._id;
      res.redirect('/chat');
    } catch(err) {
      res.render('register', { error: 'Registration failed.' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect('/login');
    });
});

module.exports = router;
