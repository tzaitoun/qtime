const Course = require('../models/course');
const Instructor = require('../models/instructor');
const Student = require('../models/student');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const authInstructor = require('../middleware/authInstructor');
const authStudent = require('../middleware/authStudent');
const shortid = require('shortid');

router.post('/', authInstructor, async (req, res) => {
    const { error, value } = validate(req.body);
    if (error) return res.status(400).json({ status_message: 'Bad Request: ' + error.details[0].message });

    const instructor = await Instructor.findById(req.uId);

    const joinCode = shortid.generate();

    const course = new Course({
        name: value.name,
        code: value.code,
        joinCode: joinCode,
        courseOwner: {
            _id: instructor._id,
            firstName: instructor.firstName,
            lastName: instructor.lastName
        }
    });

    await course.save();

    instructor.courses.push(course._id);
    await instructor.save();

    return res.status(200).json({ status_message: 'Success' });
});

router.post('/join', authStudent, async (req, res) => {
    const { error, value } = validateJoinCourse(req.body);
    if (error) return res.status(400).json({ status_message: 'Bad Request: ' + error.details[0].message });

    const joinCode = value.joinCode;
    if (!shortid.isValid(joinCode)) return res.status(400).json({ status_message: 'Bad Request: Invalid join code' });
    
    const course = await Course.findOne({ joinCode: joinCode });
    if (!course) return res.status(400).json({ status_message: 'Bad Request: Invalid join code' });

    const student = await Student.findById(req.uId);
    
    const isStudentEnrolled = student.courses.some(function(courseId) {
        return courseId.equals(course._id);
    });

    if (isStudentEnrolled) return res.status(400).json({ status_message: 'Bad request: You are already enrolled in this course' });
    
    student.courses.push(course._id);
    await student.save();

    return res.status(200).json({ 
        status_message: 'Success',
        _id: course._id,
        name: course.name,
        code: course.code,
        courseOwner: course.courseOwner
    });
});

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

module.exports = router;