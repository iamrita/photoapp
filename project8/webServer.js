"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var express = require('express');
var app = express();
var fs = require("fs");


mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));


app.use(session({ secret: 'secretKey', resave: false, saveUninitialized: false }));
app.use(bodyParser.json());


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            { name: 'user', collection: User },
            { name: 'photo', collection: Photo },
            { name: 'schemaInfo', collection: SchemaInfo }
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {

    if (!request.session.user_id) {
        response.status(401).send("Not Logged In");
        return;
    }

    let userList = [];
    let userJson = [];
    User.find(function (err, users) {
        userJson = JSON.parse(JSON.stringify(users))
        for (let i = 0; i < userJson.length; i++) {
            userList.push({ _id: userJson[i]._id, first_name: userJson[i].first_name, last_name: userJson[i].last_name, latest_activity: userJson[i].latest_activity});
        }
        if (userList.length === 0) {
            response.status(400).send('Not Found');
        } else {
            response.status(200).send(userList);
        }

    });

});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {

    if (!request.session.user_id) {
        response.status(401).send("Not Logged In");
        return;
    }

    var id = request.params.id; // get id parameter 
    let finalUser = {};
    let mostComments = {};


    User.findOne({ _id: id }, function (err, user) {
        if (err) {
            response.status(400).send('Internal error occurred');
            return;
        }
        else if (user === null) {
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send('User id Not found');
            return;
        }
        let newUserObj = JSON.parse(JSON.stringify(user));

        Photo.find({user_id: id}, function (err, photos) {
            if (err) {
                response.status(400).send("Error finding most recent or most commented photo");
                return;
            }
            if (photos === null) {
                response.status(200).send({ _id: newUserObj._id, first_name: newUserObj.first_name, last_name: newUserObj.last_name,
                    location: newUserObj.location, description: newUserObj.description, occupation: newUserObj.occupation})
            } else {
                mostComments = photos[0];
                let recentlyUploaded = {};
                for (let i =1 ; i < photos.length; i++) {
                    if (photos[i].comments.length > mostComments.comments.length) {
                        mostComments = photos[i];
                    }
                }
                let sorted = photos.slice().sort((a,b) =>
                     b.date_time - a.date_time
                    );
                recentlyUploaded = sorted[0];
                finalUser = {
                    _id: newUserObj._id, first_name: newUserObj.first_name, last_name: newUserObj.last_name,
                    location: newUserObj.location, description: newUserObj.description, occupation: newUserObj.occupation,
                    photo1: mostComments, photo2: recentlyUploaded
                };
                
                response.status(200).send(finalUser);
            }
        });
    });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    var id = request.params.id;
    let photosOfUser = [];

    if (!request.session.user_id) {
        response.status(401).send("Not Logged In");
        return;
    }

    Photo.find({ user_id: id }, function (err, photos) {
        if (err) {
            response.status(400).send('Internal error occurred');
            return;
        }
        let photosCopy = JSON.parse(JSON.stringify(photos));
        for (let i = 0; i < photosCopy.length; i++) {
            photosOfUser.push({
                _id: photosCopy[i]._id, user_id: photosCopy[i].user_id,
                date_time: photosCopy[i].date_time, file_name: photosCopy[i].file_name, comments: photosCopy[i].comments,
                likes: photosCopy[i].likes
            });
        }
        if (photosOfUser.length === 0) {
            console.log('no photos for this user');
            response.status(200).send([]);
            return;
        } else {
            async.each(photosOfUser, function (photo, callback) {
                if (photo.comments.length === 0) {
                    callback();
                } else {
                    async.each(photo.comments, function (comment, commentCallback) {
                        User.findOne({ _id: comment.user_id }, function (err, user) {
                            if (err) {
                                console.log("error user");
                                commentCallback(err);
                                return;
                            }
                            if (user === null) {
                                console.log("null user");
                                commentCallback(err);
                                return;
                            }
                            let newUserObj = JSON.parse(JSON.stringify(user));
                            let finalUser = {
                                _id: newUserObj._id, first_name: newUserObj.first_name, last_name: newUserObj.last_name
                            };
                            comment.user = finalUser;
                            delete comment.user_id;
                            commentCallback();
                        });
                    }, function (error) {
                        if (error) {
                            callback(error);
                            response.status(400).send('Comment Error');
                        } else {
                            callback();
                        }
                    });
                }
            }, function (err) {
                if (err) {
                    response.status(400).send('Photo Error');
                } else {
                    photosOfUser.sort((a,b) => {
                        if (b.likes.length === a.likes.length) {
                            let tempA = new Date(a.date_time);
                            let tempB = new Date(b.date_time);
                            return tempB - tempA;

                        } else {
                            return b.likes.length - a.likes.length
                        }
                    
                    });
                    response.status(200).send(photosOfUser);
                }
            });

        }
    });

});

app.post('/admin/login', function (request, response) {

    if (!request.body.login_name) {
        return;
    }

    if (request.session.user_id) {
        response.status(500).send("User already logged in")
        return;
        
    }
    User.findOne({ login_name: request.body.login_name, password:request.body.password }, function (err, user) {
        if (err) {
            response.status(500).send("Login Error");
            return;
        }
        if (user === null) {
            response.status(400).send("No user found");
            return;
        }
        request.session.user_id = user._id;
        request.session.login_name = user.login_name;
        if (request.body.newUser) {
            let activity = {action: "Just registered", thumbnail: ""};
            user.latest_activity = activity;
        } else {
        let activity = {action: "Just logged in", thumbnail: ""};
        user.latest_activity = activity;
        }
        user.save();
        response.status(200).send(user)
    });
});

app.post('/admin/logout', function (request, response) {
    User.findOne({_id: request.session.user_id}, function (err, user) {

        if (user) {
        let activity = {action: "Just logged out", thumbnail: ""};
        user.latest_activity = activity;
        user.save();
        }
    });
    delete request.session.user_id
    delete request.session.login_name
    request.session.destroy(function (err) {
        if (err) {
            response.status(400).send("Bad Request")
            return;
        }
        response.status(200).send();

    });
});

app.post('/commentsOfPhoto/:photo_id', function (request, response) {
    let comment = request.body.comment;
    if (comment === "") {
        response.status(400).send("Bad request, Comment is Empty");
        return;
    }
    let id = request.params.photo_id
    Photo.findOne({ _id: id }, function (err, photo) {
        if (err) {
            response.status(400).send("No Photo with that id exists");
            return;
        }
        let commObj = {};
        commObj.comment = comment;
        commObj.date_time = Date.now();
        commObj.user_id=request.session.user_id;
        photo.comments.push(commObj);
        photo.save();
        User.findOne({_id: request.session.user_id}, function (err, user) {
            let activity = {action: "Just commented", thumbnail: ""};
            user.latest_activity = activity;
            user.save();
        });
        response.status(200).send(photo);
      
    });

    

});

app.post('/likes/new/:photo_id', function (request, response) {
    let id = request.params.photo_id
    if (!request.session.user_id) {
        response.status(401).send("Not logged in");
        return;
    }

    Photo.findOne({_id: id}, function(err, photo) {
        if (err) {
            response.status(400).send("No Photo with that ID exists");
            return;
        }
        if (photo.likes.length !== 0) {
            for (let i = 0; i < photo.likes.length; i++) {
                if (JSON.stringify(photo.likes[i].user_id) === JSON.stringify(request.session.user_id)) {
                    return;
                }
            }
        }
        let likeObj = {};
        likeObj.user_id = request.session.user_id;
        photo.likes.push(likeObj);
        photo.save();
        response.status(200).send(photo);


    });

});


app.post('/likes/delete/:photo_id', function (request, response) {
    let id = request.params.photo_id
    if (!request.session.user_id) {
        response.status(401).send("Not logged in");
        return;
    }
    Photo.findOne({_id: id}, function(err, photo) {
        if (err) {
            response.status(400).send("No Photo with that ID exists");
            return;
        }
        let newLikes = photo.likes.filter(function(like) {
            return JSON.stringify(like.user_id) !== JSON.stringify(request.session.user_id);
        })
        photo.likes = newLikes;
        photo.save();
        response.status(200).send(photo);
    });

});

app.post('/photos/new', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not Logged In");
        return;
    }

    if (!request) {
        response.status(400).send("No photo attached");
        return;
    }


    processFormBody(request, response, function (err) {
        if (err || !request.file) {
            response.status(500).send("Error uploading photo")
            return;
        }

        var timestamp = new Date().valueOf();
        var filename = 'U' +  String(timestamp) + request.file.originalname;
    
        fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
            if (err) {
                response.status(500).send("Error writing photo")
                return;
            }
            
            Photo.create({file_name: filename, date_time: timestamp, user_id: request.session.user_id, comments: []}, function (err, newPhoto) {
                if (err) {
                    response.status(500).send("Error uploading photo to DB");
                    return;
                }
                newPhoto.save()
                User.findOne({_id: request.session.user_id}, function (err, user) {
                    let activity = {action: "Just uploaded a photo", thumbnail: newPhoto.file_name};
                    user.latest_activity = activity;
                    user.save();
                });
                console.log('Created photo', newPhoto);
                
                response.status(200).send();
            })
        });
    });





});

app.post('/delete/photo/:photoId', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not Logged In");
        return;
    }    
    let id = request.params.photoId;
    Photo.deleteOne({_id: id}, function (err, photo) {
        if (err) {
            response.status(500).send("Error deleting photo occurred");
        }
        console.log(photo);
        response.status(200).send();
    });

});

app.post('/delete/comment/:commentId', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not Logged In");
        return;
    }  
    let id = request.params.commentId;  
    Photo.updateOne({_id: request.body.id}, {$pull: {comments : {_id: id}}}, function (err, photo) {
        if (err) {
            response.status(500).send("Error deleting comment  occurred");
        }
        console.log(photo);
        response.status(200).send();
    });

});

app.post('/delete/user/:userId', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not Logged In");
        return;
    }  
    let id = request.params.userId;
    Photo.deleteMany({user_id: id}, function (err, photo) {
        if (err) {
            response.status(400).send("Error Deleting Photos");
            return;
        } 

        console.log(photo);
        Photo.find({'comments.user_id': id}, function (err, photos) {
            if (err) {
                response.status(400).send("Error deleting comments");
                return;
            }
            for (let i = 0; i < photos.length; i++) {
                Photo.updateOne({_id: photos[i]._id}, {$pull : {comments : {user_id: id}}}, function (err, photo) {
                    if (err) {
                        response.status(500).send("Error deleting comments off other photos occurred");
                    }
                    console.log(photo);
                    Photo.updateOne({_id: photos[i]._id}, {$pull : {likes : {user_id: id}}}, function (err, photo) {
                        if (err) {
                            response.status(500).send("Error deleting likes off other photos occurred");
                        }
                        console.log(photo);
                    
                    });
                 });
            }
            User.deleteOne({_id: id}, function (err, user) {
                if (err) {
                    response.status(500).send("Error deleting user occurred");
                }
                console.log(user);
                response.status(200).send();

            })
        })
    });
});



app.post('/user', function(request, response) {
   
    if (request.body.first_name === "" || request.body.last_name === "" || request.body.password === "") {
        response.status(400).send("Empty first name, last name, or password");
        return;
    }

    User.findOne({login_name: request.body.login_name}, function(err, user) {
        if (user) {
            response.status(400).send("User already exists");
            return;
        }
        if (err) {
            response.status(500).send("Error creating new user");
            return;
        }
        let activity = {action: "registered as a user", thumbnail: ""};
        User.create({first_name: request.body.first_name, last_name: request.body.last_name, login_name: request.body.login_name,
        password: request.body.password, location: request.body.location, description: request.body.status, occupation: request.body.occupation, latest_activity:activity}, function (err, newUser) {
            if (err) {
                response.status(500).send("Error creating new user in DB");
                return;
            }
            newUser.save();
            console.log('Created user', newUser);
            response.status(200).send();
        })
    });


});

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});

