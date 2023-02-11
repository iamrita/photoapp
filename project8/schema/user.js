"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a User
 */
/* jshint node: true */

var mongoose = require('mongoose');

var activitySchema = new mongoose.Schema({
    action: String,
    thumbnail: String
});

// create a schema
var userSchema = new mongoose.Schema({
    login_name: String, // Login name of the user
    password: String, // Password of the user
    first_name: String, // First name of the user.
    last_name: String,  // Last name of the user.
    location: String,    // Location  of the user.
    description: String,  // A brief user description
    occupation: String,  // Occupation of the user.
    latest_activity: activitySchema
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
