//####### Connect mongodb to nodejs #####

//import required modules
const mongoose = require('mongoose');
let db = null;
let isConnectedDB = false;

const database_connection = async (db_name, db_user, db_passwd, db_host, db_port) => {
    // Set mongoose connection options
   const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 60000, // Increase the timeout to 6000 seconds (adjust as needed)
   };

   //set mongoose connection
   const mongoDBurl = `mongodb://${db_user}:${db_passwd}@${db_host}:${db_port}/${db_name}?authSource=admin`;
   //connection to mongo container
   try {
      if (!db) {
         db = await mongoose.connect(mongoDBurl, options); 
      }
      console.log('SUCCESSFULLY CONNECTED TO MONGODB');
      return true; // Connection successful
   } catch (error) {
      console.error('FAILED TO CONNECT');
      console.error('Error connecting to MongoDB', error);
      return false; // Connection failed
   }
};
module.exports = database_connection;

