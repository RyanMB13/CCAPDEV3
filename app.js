const express = require('express');
const server = express();

const bodyParser = require('body-parser');
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const handlebars = require('handlebars');

handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context);
});

const expressHandlebars = require('express-handlebars');
const hbs = expressHandlebars.create({
    extname: 'hbs',
    helpers: {
    }
});

server.set('view engine', 'hbs');
server.engine('hbs', hbs.engine);

server.use(express.static('public'));

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
mongoose.connect('mongodb://127.0.0.1:27017/uniwall');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const session = require('express-session');

server.use(session({
    secret: 'a secret fruit',
    resave: false,
    saveUninitialized: true,
}));


function errorFn(err) {
    console.log('Error found. Please trace!');
    console.error(err);
}

// Note: Mongoose adds an extra s at the end of the collection
// it connects to. So "post" becomes "posts"

const userSchema = new mongoose.Schema({
    user_name: { type: String },
    user_password: { type: String },
    visible: {type: Boolean}
}, { versionKey: false });

const userModel = mongoose.model('user', userSchema);

const eventSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    event_title: { type: String },
    event_poster: { type: String },
    event_date: { type: String },
    event_content: { type: String },
    event_id: { type: String },
    event_likes: { type: Number },
    event_dislikes: { type: Number },
    event_type: { type: String },
    visible: { type: Boolean }
}, { versionKey: false });


const eventModel = mongoose.model('event', eventSchema);

const commentSchema = new mongoose.Schema({
    event_id: { type: String },
    comment_poster: { type: String },
    comment_date: { type: String },
    comment_content: { type: String },
}, { versionKey: false });

const commentModel = mongoose.model('comment', commentSchema);

const postSchema = new mongoose.Schema({
    post_title: {type: String},
    post_author: {type: String},
    post_date: {type: String},
    post_content: {type: String},
    post_id: {type: String},
    post_likes: { type: Number },
    post_dislikes: { type: Number },
    visible: { type: Boolean }
}, {versionKey:false});

const postModel = mongoose.model('post', postSchema);

const feedbackSchema = new mongoose.Schema({
    post_id: { type: String },
    comment_author: { type: String },
    comment_date: { type: String },
    comment_content: { type: String },
}, { versionKey: false });

const feedbackModel = mongoose.model('feedback', feedbackSchema);

const surveySchema = new mongoose.Schema({
    survey_id: { type: String },
    survey_author: { type: String },
    survey_date: { type: String },
    survey_content: { type: String },
    survey_status: { type: String },

}, { versionKey: false });

const surveyModel = mongoose.model('survey', surveySchema);

const profileSchema = new mongoose.Schema({
    profile_name: { type: String },
    profile_course: { type: String },
    profile_picture: { type: String }
}, { versionKey: false });

const profileModel = mongoose.model('profile', profileSchema);

server.get('/', function (req, resp) {
    resp.render('login', {
        layout: 'index',
        title: 'UniWall Login'
    });
});

server.get('/main', function (req, resp) {
    const searchQuery = {};

    postModel.find(searchQuery).lean().then(function (post_data) {
        resp.render('main', {
            layout: 'index',
            title: 'UniWall Posts',
            post_data: post_data,
            session: req.session // Pass session data to the template
        });
    }).catch(errorFn);
});

// Define a schema for the counter collection
const counterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: Number, default: 1 }
});

// Create a model for the counter collection
const counterModel = mongoose.model('counter', counterSchema);

// Function to get the next value of the counter and increment it
async function getNextSequenceValue(sequenceName) {
    const sequenceDocument = await counterModel.findOneAndUpdate(
        { name: sequenceName },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
    );
    return sequenceDocument.value;
}

server.get('/post/:post_id', function (req, resp) {
    const searchQuery = req.params.post_id;

    console.log('Post ID:', searchQuery);

    postModel.findOne({ post_id: searchQuery }).lean().then(function (post) {
        feedbackModel.find({post_id: searchQuery}).lean().then(function (feedback) {
            console.log('post Data Before Rendering:', post);
            console.log('Comment Data Before Rendering:', feedback);
            if (post) {
                resp.render('maincomments', {
                    layout           : 'index',
                    title            : 'UniWall Event Page',
                    post             :  post,
                    feedback         :  feedback,
                    session: req.session // Pass session data to the template
                });
            } else {
                resp.status(404).send('Post not found');
            }
        }).catch(errorFn);
    }).catch(errorFn);        
});

server.post('/submitPost', async function (req, res) {
    try {
        const { postTitle, postDate, postContent, postType } = req.body;

        // Check if the user is logged in
        if (!req.session.username) {
            return res.status(401).send('You must be logged in to submit a post');
        }

        // Get the number of posts in the database
        const numPostsResponse = await fetch('http://localhost:9090/getNumPosts');
        if (!numPostsResponse.ok) {
            throw new Error('Failed to get the number of Posts');
        }
        const numPosts = await numPostsResponse.json();

        // Parse the number of Posts to an integer
        const numPostsInt = parseInt(numPosts);

        // Create new Post document
        const newPost = new postModel({
            _id: new mongoose.Types.ObjectId(),
            post_title: postTitle,
            post_author: req.session.username, // Use the username from the session
            post_date: postDate,
            post_content: postContent,
            post_likes: 0, 
            post_dislikes: 0, 
            visible: true,
            // Convert the post ID back to a string
            post_id: (numPostsInt + 1).toString()
        });

        // Save the new post to the database
        const savedPost = await newPost.save();
        console.log('New Post saved:', savedPost);
        res.redirect('/main'); 
    } catch (error) {
        console.error('Error saving Post:', error);
        res.status(500).send('Error saving Post');
    }
});


// Define a schema for the counter collection for post_id
const postCounterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: Number, default: 1 }
});

// Create a model for the counter collection for event_id
const postCounterModel = mongoose.model('postCounter', postCounterSchema);

// Route handler to get the number of events in the database
server.get('/getNumPosts', async function (req, res) {
    try {
        const numPosts = await postModel.countDocuments();
        res.json(numPosts);
    } catch (error) {
        console.error('Error getting number of Posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

server.get('/getNextPostId', async function (req, res) {
    try {
        const nextPostId = await getNextSequenceValue('post_id');
        res.json(nextPostId);
    } catch (error) {
        console.error('Error getting next post ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Add a route to handle comment submission
server.post('/submitComment', function(req, res) {
    const postId = req.body.postId;
    const commentText = req.body.commentText;

    // Check if the user is logged in
    if (!req.session.username) {
        return res.status(401).send('You must be logged in to submit a comment');
    }

    // Create a new comment document
    const newComment = new feedbackModel({
        post_id: postId,
        comment_author: req.session.username, // Use the username from the session
        comment_date: new Date().toLocaleString(),
        comment_content: commentText
    });

    // Save the new comment to the database
    newComment.save()
        .then(savedComment => {
            console.log('New comment saved:', savedComment);
            res.redirect(`/post/${postId}`); // Redirect back to the post page after successful submission
        })
        .catch(error => {
            console.error('Error saving comment:', error);
            res.status(500).send('Error saving comment');
        });
});


server.post('/likePost/:postId', async function (req, res) {
    const postId = req.params.postId;
    try {
        const updatedPost = await postModel.findOneAndUpdate({ post_id: postId }, { $inc: { post_likes: 1 } }, { new: true });
        if (!updatedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const likes = parseInt(updatedPost.post_likes);
        res.json({ likes });
    } catch (error) {
        console.error('Error liking Post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

server.post('/dislikePost/:postId', async function (req, res) {
    const postId = req.params.postId;
    try {
        const updatedPost = await postModel.findOneAndUpdate({ post_id: postId }, { $inc: { post_dislikes: 1 } }, { new: true });

        if (!updatedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const dislikes = parseInt(updatedPost.post_dislikes);
        res.json({ dislikes });
    } catch (error) {
        console.error('Error disliking post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

server.get('/getNextEventId', async function (req, res) {
    try {
        const nextEventId = await getNextSequenceValue('event_id');
        res.json(nextEventId);
    } catch (error) {
        console.error('Error getting next event ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route to handle displaying the edit form for a specific post
server.get('/editPost/:postId', function (req, res) {
    const postId = req.params.postId;

    // Retrieve the event data from the database
    postModel.findOne({ post_id: postId })
        .then(post => {
            if (!post) {
                res.status(404).send('post not found');
            } else {
                // Render the edit form with the existing data pre-filled
                res.render('editPost', { post: post });
            }
        })
        .catch(error => {
            console.error('Error finding post:', error);
            res.status(500).send('Internal Server Error');
        });
});

// Route to handle editing an event
server.post('/editPost/:postId', function (req, res) {
    const postId = req.params.postId;
    const { postTitle, postContent } = req.body;

    // Update the event data in the database
    postModel.findOneAndUpdate({ post_id: postId }, { post_title: postTitle, post_content: postContent })
        .then(updatedPost => {
            if (!updatedPost) {
                res.status(404).send('post not found');
            } else {
                res.redirect(`/post/${postId}`); // Redirect back to the event page after successful edit
            }
        })
        .catch(error => {
            console.error('Error updating post:', error);
            res.status(500).send('Internal Server Error');
        });
});


server.post('/deletePost/:postId', async function (req, res) {
    const postId = req.params.postId;
    try {
        const updatedPost = await postModel.findOneAndUpdate({ post_id: postId }, { visible: false }, { new: true });
        if (!updatedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.redirect('/');
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});





server.get('/events', function (req, resp) {
    const searchQuery = {};

    eventModel.find(searchQuery).lean().then(function (event_data) {
        resp.render('events', {
            layout      : 'index',
            title       : 'UniWall Events',
            event_data  : event_data,
            session: req.session // Pass session data to the template
        });
    }).catch(errorFn);
});


server.get('/event/:event_id', function (req, resp) {
    const searchQuery = req.params.event_id;

    console.log('Event ID:', searchQuery);

    eventModel.findOne({ event_id: searchQuery }).lean().then(function (event) {
        commentModel.find({event_id: searchQuery}).lean().then(function (comment) {
            console.log('Event Data Before Rendering:', event);
            console.log('Comment Data Before Rendering:', comment);
            if (event) {
                resp.render('eventpage', {
                    layout      : 'index',
                    title       : 'UniWall Event Page',
                    event       : event,
                    comment     : comment,
                    session: req.session // Pass session data to the template
                });
            } else {
                resp.status(404).send('Event not found');
            }
        }).catch(errorFn);
    }).catch(errorFn);        
});

server.post('/likeEvent/:eventId', async function (req, res) {
    const eventId = req.params.eventId;
    try {
        const updatedEvent = await eventModel.findOneAndUpdate({ event_id: eventId }, { $inc: { event_likes: 1 } }, { new: true });
        if (!updatedEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }
        const likes = parseInt(updatedEvent.event_likes);
        res.json({ likes });
    } catch (error) {
        console.error('Error liking event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

server.post('/dislikeEvent/:eventId', async function (req, res) {
    const eventId = req.params.eventId;
    try {
        const updatedEvent = await eventModel.findOneAndUpdate({ event_id: eventId }, { $inc: { event_dislikes: 1 } }, { new: true });

        if (!updatedEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }
        const dislikes = parseInt(updatedEvent.event_dislikes);
        res.json({ dislikes });
    } catch (error) {
        console.error('Error disliking event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Define a schema for the counter collection for event_id
const eventCounterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: Number, default: 1 }
});

// Create a model for the counter collection for event_id
const eventCounterModel = mongoose.model('eventCounter', eventCounterSchema);

// Route handler to get the number of events in the database
server.get('/getNumEvents', async function (req, res) {
    try {
        const numEvents = await eventModel.countDocuments();
        res.json(numEvents);
    } catch (error) {
        console.error('Error getting number of events:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


server.post('/submitEvent', async function (req, res) {
    try {
        const { eventTitle, eventDate, eventContent, eventType } = req.body;

        // Check if the user is logged in
        if (!req.session.username) {
            return res.status(401).send('You must be logged in to submit an event');
        }

        // Get the number of events in the database
        const numEventsResponse = await fetch('http://localhost:9090/getNumEvents');
        if (!numEventsResponse.ok) {
            throw new Error('Failed to get the number of events');
        }
        const numEvents = await numEventsResponse.json();

        // Parse the number of events to an integer
        const numEventsInt = parseInt(numEvents);

        // Create new event document
        const newEvent = new eventModel({
            _id: new mongoose.Types.ObjectId(),
            event_title: eventTitle,
            event_poster: req.session.username, // Use the username from the session
            event_date: eventDate,
            event_content: eventContent,
            event_likes: 0, 
            event_dislikes: 0, 
            event_type: eventType, 
            visible: true,
            // Convert the event ID back to a string
            event_id: (numEventsInt + 1).toString()
        });

        // Save the new event to the database
        const savedEvent = await newEvent.save();
        console.log('New event saved:', savedEvent);
        res.redirect('/events'); 
    } catch (error) {
        console.error('Error saving event:', error);
        res.status(500).send('Error saving event');
    }
});



server.get('/getNextEventId', async function (req, res) {
    try {
        const nextEventId = await getNextSequenceValue('event_id');
        res.json(nextEventId);
    } catch (error) {
        console.error('Error getting next event ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

server.post('/submitEventComment', function(req, res) {
    const eventId = req.body.eventId;
    const commentText = req.body.commentText;

    // Create a new comment document
    const newComment = new commentModel({
        event_id: eventId,
        comment_poster: "User", // You can modify this to get the actual user who is logged in
        comment_date: new Date().toLocaleString(),
        comment_content: commentText
    });

    // Save the new comment to the database
    newComment.save()
        .then(savedComment => {
            console.log('New comment saved:', savedComment);
            res.redirect(`/event/${eventId}`); // Redirect back to the event page after successful submission
        })
        .catch(error => {
            console.error('Error saving comment:', error);
            res.status(500).send('Error saving comment');
        });
});

// Route to handle displaying the edit form for a specific event
server.get('/editEvent/:eventId', function (req, res) {
    const eventId = req.params.eventId;

    // Retrieve the event data from the database
    eventModel.findOne({ event_id: eventId })
        .then(event => {
            if (!event) {
                res.status(404).send('Event not found');
            } else {
                // Render the edit form with the existing data pre-filled
                res.render('editEvent', { event: event });
            }
        })
        .catch(error => {
            console.error('Error finding event:', error);
            res.status(500).send('Internal Server Error');
        });
});

// Route to handle editing an event
server.post('/editEvent/:eventId', function (req, res) {
    const eventId = req.params.eventId;
    const { eventTitle, eventContent } = req.body;

    // Update the event data in the database
    eventModel.findOneAndUpdate({ event_id: eventId }, { event_title: eventTitle, event_content: eventContent })
        .then(updatedEvent => {
            if (!updatedEvent) {
                res.status(404).send('Event not found');
            } else {
                res.redirect(`/event/${eventId}`); // Redirect back to the event page after successful edit
            }
        })
        .catch(error => {
            console.error('Error updating event:', error);
            res.status(500).send('Internal Server Error');
        });
});


server.post('/deleteEvent/:eventId', async function (req, res) {
    const eventId = req.params.eventId;
    try {
        const updatedEvent = await eventModel.findOneAndUpdate({ event_id: eventId }, { visible: false }, { new: true });
        if (!updatedEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.redirect('/events');
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

server.post('/register', async function (req, res) {
    try {
        const { username, password } = req.body;

        // Check if the username already exists in the database
        const existingUser = await userModel.findOne({ user_name: username });
        if (existingUser) {
            return res.status(400).send('Username already exists');
        }

        // Generate a salt to hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user document
        const newUser = new userModel({
            user_name: username,
            user_password: hashedPassword,
            visible: true
        });

        // Save the new user to the database
        const savedUser = await newUser.save();
        console.log('New User saved:', savedUser);

        // Create a new profile for the user
        const newProfile = new profileModel({
            profile_name: username,
            profile_course: 'Student', 
            profile_picture: '/img/profile-picture.png' 
        });

        // Save the new profile to the database
        const savedProfile = await newProfile.save();
        console.log('New Profile saved:', savedProfile);

        res.status(200).send('Registration successful');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});


server.post('/login', async function (req, res) {
    const username = req.body.user;
    const password = req.body.pass;

    console.log('Received username:', username);

    try {
        // Find the user by username
        const user = await userModel.findOne({ user_name: username }).lean();

        if (!user) {
            console.log('Username not found');
            return res.status(404).json({ error: 'Username not found' });
        }

        // Compare the hashed password with the provided password
        const passwordMatch = await bcrypt.compare(password, user.user_password); // Check this line

        if (!passwordMatch) {
            console.log('Incorrect password');
            return res.status(401).json({ error: 'Incorrect password' });
        }

        // Password is correct, login successful
        console.log('Login successful for user:', username);

        // Store the username in the session
        req.session.username = username;

        // Redirect to '/main'
        res.status(200).json({ message: 'Login successful', redirect: '/main' });
    } catch (error) {
        console.error('Error occurred during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



server.get('/survey', function (req, resp) {
    const searchQuery = {};
    surveyModel.find(searchQuery).lean().then(function (survey_data) {
        resp.render('survey', {
            layout      : 'index',
            title       : 'UniWall Posts',
            survey_data   : survey_data,
            session: req.session // Pass session data to the template
        });
    }).catch(errorFn);
});

server.get('/profile/:post_author', function (req, res) {
    const searchQuery = req.params.post_author;
    profileModel.findOne({ profile_name: searchQuery }).lean().then(function (profile) {
        postModel.find({ post_author: searchQuery }).lean().then(function (post) {
            if (profile) {
                res.render('profile', {
                    layout: 'index',
                    title: 'UniWall Profile',
                    profile: profile, 
                    post: post,
                    session: req.session // Pass session data to the template
                });
            } else {
                res.status(404).send('Profile not found');
            }
        }).catch(errorFn);
    });
});

server.get('/login', function (req, resp) {
    resp.render('login', {
        layout: 'index',
        title: 'UniWall Login'
    });
});

server.get('/register', function (req, resp) {
    resp.render('register', {
        layout: 'index',
        title: 'UniWall Register'
    });
});

server.get('/profile', function (req, resp) {
    resp.render('profile', {
        layout: 'index',
        title: 'UniWall Profile',
        session: req.session // Pass session data to the template
    });
});

// Route handler for handling user logout
server.get('/logout', function(req, res) {
    // Destroy the user's session
    req.session.destroy(function(err) {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Error logging out');
        } else {
            res.redirect('/login'); // Redirect to login page or wherever you want after logout
        }
    });
});


function finalClose(){
    console.log('Close connection at the end!');
    mongoose.connection.close();
    process.exit();
}

process.on('SIGTERM',finalClose);
process.on('SIGINT',finalClose);
process.on('SIGQUIT', finalClose);

const port = process.env.PORT || 9090;
server.listen(port, function () {
    console.log('Listening at port ' + port);
});
