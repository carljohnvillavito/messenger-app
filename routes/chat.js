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
 router.get('/user/:id', ensureAuthenticated, async (req, res) => {
      const { id } = req.params;
        const profile = await User.findById(id);
        if (!profile) {
          return res.status(404).send("User not found.");
        }
            res.render('user_profile', { profile });
  });


module.exports = router;
