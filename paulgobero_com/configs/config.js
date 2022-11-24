
//file to load environment variables
const dotenv = require('dotenv');
const result = dotenv.config({ path: '/mnt/portfolio/paulgobero/configs/.env.prod' });
if (result.error) {
    throw result.error;
}
const { parsed:envs } = result;
console.log(envs);
module.exports = envs;

