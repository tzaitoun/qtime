const express = require('express');
const students = require('../routes/students');
const studentsMe = require('../routes/studentsMe');
const instructors = require('../routes/instructors');
const instructorsMe = require('../routes/instructorsMe');
const courses = require('../routes/courses');

module.exports = function(app) {
    app.use(express.json());
    app.use('/students/me', studentsMe);
    app.use('/students', students);
    app.use('/instructors/me', instructorsMe);
    app.use('/instructors', instructors);
    app.use('/courses', courses);
}