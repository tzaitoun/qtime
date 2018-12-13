const authSocket = require('./middleware/authSocket');

const express = require('express');
const app = express();
const server = require('http').createServer(app);

const io = require('socket.io')(server);
const nsp = io.of(/^\/courses\/[a-f\d]{24}\/classroom$/);
nsp.use(authSocket);

require('./startup/firebaseAuth')();
require('./startup/db')();
require('./startup/objectIdValidation')();
require('./startup/routes')(app, nsp);

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Listening on port ${port}...`));

module.exports = server;