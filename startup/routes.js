const express = require('express');
const helmet = require('helmet');

const students = require('../routes/students');
const instructors = require('../routes/instructors');
const courses = require('../routes/courses');

const errorHandler = require('../middleware/errorHandler');

module.exports = function(app, nsp) {
    app.use(helmet);
    app.use(express.json());
    app.use(function(req, res, next) {
        req.nsp = nsp;
        next();
    });
    app.use('/students', students);
    app.use('/instructors', instructors);
    app.use('/courses', courses);
    app.use('*', function(req, res, next) {
        res.status(404).json({ status_message: 'Not Found' });
    });
    app.use(errorHandler);
}