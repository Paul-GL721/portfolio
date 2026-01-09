const mongoose = require('mongoose');

module.exports = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    }

    console.log('MongoDB dropped & connection closed (globalTeardown)');
};
