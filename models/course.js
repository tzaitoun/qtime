const mongoose = require('mongoose');
const Joi = require('joi');

const courseOwnerSchema = new mongoose.Schema({
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
    }
});

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
    courseOwner: courseOwnerSchema
});

const Course = mongoose.model('Course', schema);

function validate(req) {
    const schema = {
        name: Joi.string().trim().min(1).max(30).required(),
        code: Joi.string().trim().min(1).max(30)
    };

    return Joi.validate(req, schema);
}

module.exports.Course = Course;
module.exports.validate = validate;