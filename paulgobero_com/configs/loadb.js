//####### Connect mongodb to nodejs #####

const database_connection = async (db_name, db_user, db_passwd, db_host, db_port) => {
   //import required modules
   const mongoose = require('mongoose');

   //set mongoose connection
   const mongoDBurl = `mongodb://${db_user}:${db_passwd}@${db_host}:${db_port}/${db_name}?authSource=admin`;
   try {
      await mongoose.connect(mongoDBurl, { useNewUrlParser: true, useUnifiedTopology: true }); 
      console.log('SUCCESSFULLY CONNECTED TO MONGODB');
   } catch (error) {
      console.error('FAILED TO CONNECT');
      console.error('Error connecting to MongoDB', error);
   }
};
module.exports = database_connection;

