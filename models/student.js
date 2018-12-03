const mongoose = require('mongoose');

const schema = new mongoose.Schema({
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
    studentId: {
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
    }
});

const Student = mongoose.model('Student', schema);

module.exports = Student;