//####### Connect mongodb to nodejs #####

var database_connection = function () {
   //import required modules and variables
   const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = require('./config');
   const mongoose = require('mongoose');

   //set mongoose connection
   const mongoDB = "mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin";
   mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

   //make the connection
   const db = mongoose.connection;

   //handle errors
   db.on("error", console.error.bind(console, "MongoDB connection error:"));
};
module.exports = database_connection

