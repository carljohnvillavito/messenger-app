// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/message'); // Bring back the Message model
const User = require('./models/user'); // Bring back the User model

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

    app.set('view engine', 'ejs');

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGODB_URI })
}));

// Routes
app.use(authRoutes);
app.use(chatRoutes);

// Basic route for home
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/chat');
    } else {
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    if (req.session.userId) {
       return res.redirect('/chat');
    }
   res.render('login', { error: null, success: null });
});

app.get('/register', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/chat');
     }
   res.render('register', { error: null, success: null });
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('chat message', async (msg) => {
        try {
            const user = await User.findById(msg.sender._id);
            const newMessage = new Message({ sender: user._id, content: msg.content });
            await newMessage.save();
             io.emit('chat message', { ...msg, sender: { _id: user._id, username: user.username }});
        } catch (error) {
            console.error('Error saving message', error)
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
