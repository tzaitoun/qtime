const mongoose = require('mongoose');
const Joi = require('joi');

/* This model represents a student and is used to keep track of their details and the courses that they are enrolled in */
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

function validate(req) {
    const schema = {
        firstName: Joi.string().trim().min(1).max(30).required(),
        lastName: Joi.string().trim().min(1).max(30).required(),
        studentId: Joi.string().trim().min(1).max(30).required(),
        university: Joi.string().trim().min(1).max(30).required()
    };

    return Joi.validate(req, schema);
}

module.exports.Student = Student;
module.exports.validate = validate;