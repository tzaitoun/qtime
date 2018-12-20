const mongoose = require('mongoose');

let server;

// These are root hooks that will only be run once at the beginning (before) and once at the end (after) of all tests
before(() => {
    server = require('../index');
    module.exports = server;
});

after(async () => {
    await mongoose.disconnect();
    await server.close();
});