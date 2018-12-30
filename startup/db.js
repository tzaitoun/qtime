const mongoose = require('mongoose');
const config = require('config');
const logger = require('../logger');

module.exports = function() {
    const db = config.get('db');
    
    if (process.env.NODE_ENV === 'production') {
        mongoose.connect(db, { useNewUrlParser: true, auth: { authSource: 'admin' } })
            .then(() => logger.info(`Connected to qtime database...`))
            .catch((err) => logger.error(err));
    }

    else {
        mongoose.connect(db, { useNewUrlParser: true })
            .then(() => logger.info(`Connected to ${db}...`))
            .catch((err) => logger.error(err));
    }
}