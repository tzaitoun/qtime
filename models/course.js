const mongoose = require('mongoose');

const schema = new mongoose.Schema({
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
    },
    instructors: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Instructor' }]
    },
    students: {
        type: [{ type: mongoose.Schema.Types.ObjectId }]
    }
});

const Course = mongoose.model('Course', schema);

module.exports = Course;