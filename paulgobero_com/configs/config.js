
//file to load environment variables
const dotenv = require('dotenv');
<<<<<<< .merge_file_a15944

//loads env variables from local machine
const result = dotenv.config({ path: __dirname+'/.env.dev' });

//load env variables from docker-compose
//const result = dotenv.config();

=======
const result = dotenv.config({ path: '/mnt/portfolio/paulgobero/configs/.env.prod' });
>>>>>>> .merge_file_a08428
if (result.error) {
    throw result.error;
}
const { parsed:envs } = result;
module.exports = envs;

