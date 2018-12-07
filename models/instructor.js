const mongoose = require('mongoose');
const Joi = require('joi');

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

const Instructor = mongoose.model('Instructor', schema);

function validate(req) {
    const schema = {
        firstName: Joi.string().trim().min(1).max(30).required(),
        lastName: Joi.string().trim().min(1).max(30).required(),
        university: Joi.string().trim().min(1).max(30).required()
    };

    return Joi.validate(req, schema);
}

module.exports.Instructor = Instructor;
module.exports.validate = validate;