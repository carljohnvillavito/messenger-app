// routes/chat.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');

function ensureAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

router.get('/chat', ensureAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.userId);
    res.render('chat', { messages: [], user }); // Remove the messages variable, send an empty array.
});

module.exports = router;
