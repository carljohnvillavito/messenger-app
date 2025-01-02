// routes/chat.js
const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const User = require('../models/user');

function ensureAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

router.get('/chat', ensureAuthenticated, async (req, res) => {
    const messages = await Message.find().populate('sender');
    const user = await User.findById(req.session.userId);
    res.render('chat', { messages, user });
});

router.post('/chat/send', ensureAuthenticated, async (req, res) => {
    const { content } = req.body;
    const newMessage = new Message({ sender: req.session.userId, content });
    await newMessage.save();
    res.redirect('/chat');
});

module.exports = router;
