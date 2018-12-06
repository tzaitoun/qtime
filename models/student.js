const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
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
    },
    email: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 30
    },
    courses: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
    }
});

const Student = mongoose.model('Student', schema);

module.exports = Student;