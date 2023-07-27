
//file to load environment variables
const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';

let envFilePath;
let result;

if (env === 'production') {
  envFilePath = '.env.prod';
} else if (env === 'test') {
  // Check if running in Jenkins
  if (process.env.JENKINS_HOME) {
    result = dotenv.config('/mnt/portfolio/envConfigs/.env.test');
  } else {
    envFilePath = '.env.test';
  }
} else {
  envFilePath = '.env.dev';
}

result = dotenv.config({ path: __dirname + '/' + envFilePath });

//loads env variables from local machine
//const result = dotenv.config({ path: __dirname+'/.env.dev' });
//const result = dotenv.config({ path: __dirname+'/.env.test' });

//load env variables from docker-compose
//const result = dotenv.config();

if (result.error) {
    throw result.error;
}
const { parsed:envs } = result;
module.exports = envs;

