//####### Connect mongodb to nodejs #####

//import required modules
const mongoose = require('mongoose');
let db = null;

const database_connection = async (db_name, db_user, db_passwd, db_host, db_port) => {

   //set mongoose connection
   const mongoDBurl = `mongodb://${db_user}:${db_passwd}@${db_host}:${db_port}/${db_name}?authSource=admin`;
   try {
      if (!db) {
         db = await mongoose.connect(mongoDBurl, { useNewUrlParser: true, useUnifiedTopology: true }); 
      }
      console.log('SUCCESSFULLY CONNECTED TO MONGODB');
   } catch (error) {
      console.error('FAILED TO CONNECT');
      console.error('Error connecting to MongoDB', error);
      process.exit(1);
   }
};
module.exports = database_connection;

