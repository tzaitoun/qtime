const express = require('express');
const students = require('../routes/students');
const studentsMe = require('../routes/studentsMe');
const instructors = require('../routes/instructors');
const instructorsMe = require('../routes/instructorsMe');
const courses = require('../routes/courses');

module.exports = function(app, nsp) {
    app.use(express.json());
    app.use(function(req, res, next) {
        req.nsp = nsp;
        next();
    });
    app.use('/students', students);
    app.use('/instructors', instructors);
    app.use('/courses', courses);
}