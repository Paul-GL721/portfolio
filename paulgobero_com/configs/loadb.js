//####### Connect mongodb to nodejs #####

//import required modules
const mongoose = require('mongoose');
const dbState = require('../utils/dbstate');

let db = null;
//let isConnectedDB = false;

const database_connection = async (db_name, db_user, db_passwd, db_host, db_port) => {
    // Set mongoose connection options
   const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 60000, // Increase the timeout to 6000 seconds (adjust as needed)
   };
   //set mongoose connection
   let mongoDBurl;

   const env = process.env.NODE_ENV;

   if (env === 'production' || env === 'stage') {
      // Replica Set connection via Traefik in prod/staging/test
      mongoDBurl = `mongodb://${db_user}:${db_passwd}@${db_host}/${db_name}?authSource=admin&replicaSet=replicaset`;
   } else {
      // Local development connection
      mongoDBurl = `mongodb://${db_user}:${db_passwd}@${db_host}:${db_port}/${db_name}?authSource=admin`;
   }

   //connection to mongo container
   try {
      if (!db) {
         db = await mongoose.connect(mongoDBurl, options); 
      }
      dbState.setReady();
      console.log('SUCCESSFULLY CONNECTED TO MONGODB');
      return true; // Connection successful
   } catch (error) {
      dbState.setNotReady();
      console.error('FAILED TO CONNECT');
      console.error('MongoDBurl is', mongoDBurl);
      console.error('Error connecting to MongoDB', error);
      return false; // Connection failed
   }
};
/* Event handlers for mongoose connection states */
// Temporary loss (replica re-election, network issue)
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
  dbState.setNotReady();
});

// Fatal errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
  dbState.setNotReady();
});
module.exports = database_connection;