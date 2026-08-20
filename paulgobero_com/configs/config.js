
//file to load environment variables
const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';

let envFilePath;

if (env === 'production') {
  envFilePath = '.env.prod';
} else if (env === 'test') {
  envFilePath = '.env.test';
} else {
  envFilePath = '.env.stage' ;
}

const result = dotenv.config({ path: __dirname + '/' + envFilePath });

//loads env variables from local machine
//const result = dotenv.config({ path: __dirname+'/.env.dev' });
//const result = dotenv.config({ path: __dirname+'/.env.test' });

//load env variables from docker-compose
//const result = dotenv.config();

if (result.error && result.error.code !== 'ENOENT') {
    throw result.error;
}

// Docker Compose and Jenkins inject configuration through process.env. The
// local dotenv file is optional in those environments, and injected values
// take precedence when both sources are available.
const envs = {
    ...(result.parsed || {}),
    ...process.env
};

module.exports = envs;
