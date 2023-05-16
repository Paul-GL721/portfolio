module.exports = {
    mongodbMemoryServerOptions: {
        binary: {
            version: 'latest',
            skipMD5: true,
        },
        instance: {
            dbName: 'testportfolio',
            storageEngine: 'wiredTiger',
        },
        autoStart: false,
    },
};