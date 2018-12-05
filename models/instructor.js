const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 30
    },
    code: {
        type: String,
        minlength: 1,
        maxlength: 30
    },
    joinCode: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 30
    }
});

const instructorSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    firstName: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 30
    },
    lastName: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 30
    },
    university: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 30
    },
    courses: [courseSchema]
});

const Instructor = mongoose.model('Instructor', instructorSchema);

module.exports = Instructor;