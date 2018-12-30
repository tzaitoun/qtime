const winston = require('winston');

const logFormat = winston.format.printf(info => {
    if (info.stack != null) {
        return `${info.timestamp} (${info.level.toUpperCase()}) Message: ${info.message} ${info.stack}`;
    } else {
        return `${info.timestamp} (${info.level.toUpperCase()}) Message: ${info.message}`;
    }
});

const errorStackFormat = winston.format(info => {
    if (info instanceof Error) {
        return Object.assign({}, info, {
            message: info.message,
            stack: info.stack
        });
    }

    return info;
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), errorStackFormat(), logFormat),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.combine(winston.format.timestamp(), errorStackFormat(), logFormat)
    }));
}

module.exports = logger;