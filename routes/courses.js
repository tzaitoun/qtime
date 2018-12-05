const Course = require('../models/course');
const Instructor = require('../models/instructor');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const authInstructor = require('../middleware/authInstructor');
const shortid = require('shortid');

router.post('/', authInstructor, async (req, res) => {
    const { error, value } = validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    let instructor = await Instructor.findOne({ userId: req.uId });

    const joinCode = shortid.generate();

    let course = new Course({
        name: value.name,
        code: value.code,
        joinCode: joinCode,
        instructors: [instructor._id]
    });

    await course.save();

    instructor.courses.push({
        _id: course._id,
        name: value.name,
        code: value.code,
        joinCode: joinCode
    });
    
    await instructor.save();

    return res.status(200).json({ message: 'Success' });
});

function validate(req) {
    const schema = {
        name: Joi.string().trim().min(1).max(30).required(),
        code: Joi.string().trim().min(1).max(30)
    }

    return Joi.validate(req, schema);
}

module.exports = router;