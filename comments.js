// Create web server application

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Comment = require('./models/comment');
const Post = require('./models/post');
const User = require('./models/user');
const jwt = require('jsonwebtoken');
const config = require('./config');
const cors = require('cors');
const port = process.env.PORT || 8080;

mongoose.Promise = global.Promise;
mongoose.connect(config.database, { useNewUrlParser: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('API is running');
});

app.post('/comments', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).json({ success: false, message: 'No token provided.' });
    } else {
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err) {
                res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                Post.findOne({ _id: req.body.postId }, (err, post) => {
                    if (err) {
                        res.status(500).json({ success: false, message: 'Internal server error.' });
                    } else if (post) {
                        const comment = new Comment({
                            postId: req.body.postId,
                            userId: decoded.id,
                            text: req.body.text
                        });
                        comment.save((err) => {
                            if (err) {
                                res.status(500).json({ success: false, message: 'Internal server error.' });
                            } else {
                                res.status(200).json({ success: true, message: 'Comment added.' });
                            }
                        });
                    } else {
                        res.status(404).json({ success: false, message: 'Post not found.' });
                    }
                });
            }
        });
    }
});

app.get('/comments/:postId', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).json({ success: false, message: 'No token provided.' });
    } else {
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err) {
                res.status(401).json({ success