
//file to load environment variables
const dotenv = require('dotenv');

//loads env variables from local machine
const result = dotenv.config({ path: __dirname+'/.env.dev' });

//load env variables from docker-compose
//const result = dotenv.config();

if (result.error) {
    throw result.error;
}
const { parsed:envs } = result;
module.exports = envs;

