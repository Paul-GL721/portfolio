const mongoose = require('mongoose');
const dbState = require('../utils/dbstate');

let db = null;

const database_connection = async (db_name, db_user, db_passwd, db_host, db_port) => {
   const env = process.env.NODE_ENV || 'development';

   const mongoDBurl =
      env === 'production' || env === 'stage'
         ? `mongodb://${db_user}:${db_passwd}@${db_host}/${db_name}?authSource=admin&replicaSet=replicaset`
         : `mongodb://${db_user}:${db_passwd}@${db_host}:${db_port}/${db_name}?authSource=admin`;

   const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // short initial timeout
      socketTimeoutMS: 45000,
   };

   let retries = 5;
   while (retries > 0) {
      try {
         if (!db) {
            db = await mongoose.connect(mongoDBurl, options);
            console.log(`[MongoDB] Connected to ${env} DB`);
         }
         dbState.setReady();
         break; // success, exit loop
      } catch (error) {
         console.error('[MongoDB] Initial connection failed:', error.message);
         dbState.setNotReady();
         retries--;
         if (retries > 0) await new Promise(r => setTimeout(r, 5000)); // wait 5s
      }
   }
   if (!dbState.isReady()) {
      console.error('[MongoDB] Could not connect after retries — exiting');
      process.exit(1); // fail fast in production
   }
};

/* === Connection lifecycle === */
mongoose.connection.on('connected', () => {
   console.log('[MongoDB] Connected');
   dbState.setReady();
});

mongoose.connection.on('reconnected', () => {
   console.log('[MongoDB] Reconnected');
   dbState.setReady();
});

mongoose.connection.on('disconnected', () => {
   console.warn('[MongoDB] Disconnected — retrying...');
   dbState.setNotReady();
});

mongoose.connection.on('error', (err) => {
   console.error('[MongoDB] Error:', err);
   dbState.setNotReady();
});

//Ping periodically to verify primary db is reachable
setInterval(async () => {
   if (mongoose.connection.readyState === 1) return; // already connected
   try {
      await mongoose.connection.db.admin().ping();
      if (!dbState.isReady()) {
         dbState.setReady();
         console.log('[MongoDB] Ping successful — marked READY');
      }
   } catch {
      if (dbState.isReady()) {
         dbState.setNotReady();
         console.warn('[MongoDB] Ping failed — marked NOT READY');
      }
   }
}, 15000); // every 10 seconds

module.exports = database_connection;
