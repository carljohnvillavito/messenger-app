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
const Message = require('./models/message');
const User = require('./models/user');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setting views and public directory
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGODB_URI }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
         secure: false
    }
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
