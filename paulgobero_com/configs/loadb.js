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
      connectTimeoutMS: 60000, 
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
      if (!db || mongoose.connection.readyState === 0) {
         db = await mongoose.connect(mongoDBurl, options); 
      }
      dbState.setReady();
      console.log('SUCCESSFULLY CONNECTED TO MONGODB');
      //console.log('MongoDBurl is', mongoDBurl);
      return true; // Connection successful
   } catch (error) {
      dbState.setNotReady();
      console.error('FAILED TO CONNECT');
      console.error('MongoDB target is', {
         host: db_host,
         port: db_port,
         database: db_name,
         environment: env
      });
      console.error('Error connecting to MongoDB', {
         name: error.name,
         code: error.code,
         message: error.message
      });
      return false; // Connection failed
   }
};

database_connection.close = async () => {
   if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
   }

   if (disconnectTimer) {
      clearTimeout(disconnectTimer);
      disconnectTimer = null;
   }

   db = null;
   dbState.setNotReady();
};

let disconnectTimer = null;

mongoose.connection.on('disconnected', () => {
   console.warn('[MongoDB] Disconnected');

   disconnectTimer = setTimeout(() => {
      console.warn('[MongoDB] Disconnected too long — NOT READY');
      dbState.setNotReady();
   }, 15000); // 15s grace period
});

mongoose.connection.on('connected', () => {
   if (disconnectTimer) {
      clearTimeout(disconnectTimer);
      disconnectTimer = null;
   }
   console.log('[MongoDB] Connected');
   dbState.setReady();
});

mongoose.connection.on('reconnected', () => {
   if (disconnectTimer) {
      clearTimeout(disconnectTimer);
      disconnectTimer = null;
   }
   console.log('[MongoDB] Reconnected');
   dbState.setReady();
});

module.exports = database_connection;
