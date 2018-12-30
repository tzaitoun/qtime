const mongoose = require('mongoose');
const config = require('config');
const logger = require('../logger');

module.exports = function() {
    const db = config.get('db');
    
    mongoose.set('useCreateIndex', true);
    mongoose.connect(db, { useNewUrlParser: true })
        .then(() => logger.info(`Connected to ${db}...`));
}