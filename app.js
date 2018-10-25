const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
mongoose.Promise = global.Promise;
// const errorHandler = require('./_helpers/error-handler');
const passport = require('passport');
const passportfb = require('passport-facebook').Strategy;
const session = require('express-session');
const jwt = require('jsonwebtoken');

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(session({
    secret: "Lam"
}))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
// app.use(errorHandler);



Genre = require('./models/genre');
Book = require('./models/book');
User = require('./models/user');
Facebook = require('./models/facebook')


// Connect to Mongoose
mongoose.connect('mongodb://ebook:8332965Lam@ds030827.mlab.com:30827/lamnguyen'); // Connect to MongoLab
// mongoose.connect('mongodb://localhost/bookstore');
var db = mongoose.connection;

app.get('/', (req, res) => {
    res.send('Hello Chùi Kính!')
});

app.get('/login', (req, res) => {
    res.render('login')
});

app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));

app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/', failureRedirect: '/'
}));

app.post('/api/user/authenticate', function(req, res, next) {
    User.authenticate(req.body)
        .then((user) => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
        .catch(err => next(err));
});

app.post('/api/user/register', function(req, res, next) {
    User.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
});

app.delete('/api/user/remove/:id', function(req, res, next) {
    User.removeUser(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
});

app.get('/api/genres', function(req, res) {
    Genre.getGenres(function(err, genres){
        if(err) {
            throw err;
        }
        res.json(genres);
    });
});

app.post('/api/genres', function(req, res) {
    var genre = req.body;
    Genre.addGenre(genre, function(err, genre){
        if(err) {
            throw err;
        }
        res.json(genre);
    });
});

app.put('/api/genres/update/:id', function(req, res) {
    var id = req.params.id;
    var genre = req.body;
    Genre.updateGenre(id, genre, {}, function(err, genre){
        if(err) {
            throw err;
        }
        res.json(genre);
    });
});

app.delete('/api/genres/remove/:id', function(req, res) {
    var id = req.params.id;
    Genre.removeGenre(id, function(err, genre){
        if(err) {
            throw err;
        }
        res.json(genre);
    });
});

app.get('/api/books', verifyToken, (req, res) => {
    jwt.verify(req.token, 'lamsecretkey', (err, authData) => {
        if(err) {
            res.sendStatus(403);
        } else {
            Book.getBooks(function(err, books){
                if(err) {
                    throw err;
                }
                res.json(books);
            });
        }
    });  
});

// Format of Token
// Authorization: Bearer <access_token>

// Verify Token
function verifyToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        // Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        // Next middleware
        next();
    } else {
        // Forbidden
        res.sendStatus(403);
    }
}

app.get('/api/books/:id', function(req, res) {
    Book.getBookById(req.params.id, function(err, book){
        if(err) {
            throw err;
        }
        res.json(book);
    });
});

app.post('/api/books', function(req, res) {
    var book = req.body;
    Book.addBook(book, function(err, book){
        if(err) {
            throw err;
        }
        res.json(book);
    });
});

app.put('/api/books/update/:id', function(req, res) {
    var id = req.params.id;
    var book = req.body;
    Book.updateBook(id, book, {}, function(err, book){
        if(err) {
            throw err;
        }
        res.json(book);
    });
});

app.delete('/api/books/remove/:id', function(req, res) {
    var id = req.params.id;
    Book.removeBook(id, function(err, book){
        if(err) {
            throw err;
        }
        res.json(book);
    });
});

app.listen(5000);
console.log('Running on port 5000');

passport.use(new passportfb(
    {
        clientID: "982322151954802",
        clientSecret: "801771baa2f8acce28a14a23120b45a7",
        callbackURL: "https://41fef48e.ngrok.io/auth/facebook/callback",
        profileFields: ['email', 'gender', 'locale', 'displayName']
    },
    function(accessToken, refreshToken, profile, cb) {
        // You have the access token here!
        console.log(profile);
        cb(null, profile);
        Facebook.findOne({id: profile._json.id}, (err, user) => {
            if (err) return cb(err)
            if (user) return cb(null, user)
            const newUser = new Facebook({
                id: profile._json.id,
                name: profile._json.name,
                email: profile._json.email
            })
            newUser.save((err) => {
                return cb(null, newUser)
            })
        })
        
    }));
passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    User.findOne({id}, (err, user) => {
        done(null, user)
    })
})
// ee36d03d8f6cb4338cd4004fa04a56fa