const express = require('express');
const students = require('../routes/students');
const instructors = require('../routes/instructors');

module.exports = function(app) {
    app.use(express.json());
    app.use('/students', students);
    app.use('/instructors', instructors);
}