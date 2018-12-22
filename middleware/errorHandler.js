const logger = require('../logger');

module.exports = function(err, req, res, next) {
    logger.error(err.stack);
    res.status(500).json({ status_message: 'Internal Server Error' });
}