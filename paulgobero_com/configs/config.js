
//file to load environment variables
const dotenv = require('dotenv');
const result = dotenv.config({ path: __dirname+'/.env.dev' });

if (result.error) {
    throw result.error;
}
const { parsed:envs } = result;
module.exports = envs;

