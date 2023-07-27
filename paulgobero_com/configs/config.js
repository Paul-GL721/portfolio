
//file to load environment variables
const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';

let envFilePath;

if (env === 'production') {
  envFilePath = '.env.prod';
} else if (env === 'test') {
  // Check if running in Jenkins
  if (process.env.JENKINS_HOME) {
    envFilePath = '/mnt/portfolio/envConfigs/.env.test';
  } else {
    envFilePath = '.env.test';
  }
} else {
  envFilePath = '.env.dev';
}

const result = dotenv.config({ path: __dirname + '/' + envFilePath });

if (result.error) {
    throw result.error;
}
const { parsed:envs } = result;
module.exports = envs;

