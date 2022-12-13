
//file to load environment variables
const dotenv = require('dotenv');
const result = dotenv.config({ path: '/nodeApp/stageconfigs/.env.prod' });
if (result.error) {
    throw result.error;
}
const { parsed:envs } = result;
module.exports = envs;

