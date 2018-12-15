const mongoose = require('mongoose');
const Joi = require('joi');
const courseOwnerSchema = require('./courseOwner');

/* The Course model represents a course. Each course has an owner which is the instructor who created the course. 
 * The "joinCode" is what students use to join a course and it acts as a second unique identifier of the course.
 */
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

function validateJoinCourse(req) {
    const schema = {
        joinCode: Joi.string().trim().min(1).max(30).required()
    }

    return Joi.validate(req, schema);
}

module.exports.Course = Course;
module.exports.validate = validate;
module.exports.validateJoinCourse = validateJoinCourse;