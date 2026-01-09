
const testutils = require("./utils/testUtils");

module.exports = async () => {
  await testutils.testconnection();
  console.log('✅ Global test DB connected');
};
