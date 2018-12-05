const express = require('express');
const students = require('../routes/students');
const instructors = require('../routes/instructors');
const courses = require('../routes/courses');

module.exports = function(app) {
    app.use(express.json());
    app.use('/students', students);
    app.use('/instructors', instructors);
    app.use('/courses', courses);
}