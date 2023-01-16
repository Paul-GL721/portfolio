//####### Connect mongodb to nodejs #####

const database_connection = async () => {
   //import required modules and variables
   const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = require('./config');
   const mongoose = require('mongoose');

   //set mongoose connection
   const mongoDBurl = 'mongodb://'+DB_USER+':'+DB_PASSWORD+'@'+DB_HOST+':'+DB_PORT+'/'+DB_NAME+'?authSource=admin';
   
   await mongoose.connect(mongoDBurl, { useNewUrlParser: true, useUnifiedTopology: true },
      (err) => {
         if (err) {
            console.error('FAILED TO CONNECT');
            console.error(err);
         } else {
            console.log('CONNECTED TO MONGODB');
         }
      }
   ) 
};
module.exports = database_connection;

