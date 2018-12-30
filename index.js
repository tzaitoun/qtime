const express = require('express');
const app = express();
const server = require('http').createServer(app);
require('express-async-errors');

const io = require('socket.io')(server);
const nsp = io.of(/^\/courses\/[a-f\d]{24}\/classroom$/);

require('./startup/firebaseAuth')();
require('./startup/db')();
require('./startup/objectIdValidation')();
require('./startup/routes')(app, nsp);
require('./startup/socket')(nsp);

const logger = require('./logger');
const port = process.env.PORT || 3000;
server.listen(port, () => logger.info(`Listening on port ${port}...`));

module.exports = server;