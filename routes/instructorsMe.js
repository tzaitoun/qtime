const { Instructor, validate } = require('../models/instructor');
const { Course } = require('../models/course');

const authInstructor = require('../middleware/authInstructor');

const config = require('config');
const admin = require(config.get('firebaseAdmin'));
const express = require('express');
const router = express.Router();

/* Gets the details of the current instructor */
router.get('/', authInstructor, async (req, res) => {

    const me = await Instructor.findById(req.uId).select('-_id -email -courses');
    return res.status(200).json({ status_message: 'Success', me: me });
});

/* Edits the details of the current instructor */
router.put('/', authInstructor, async (req, res) => {
    const { error, value } = validate(req.body);
    if (error) return res.status(400).json({ status_message: 'Bad Request: ' + error.details[0].message });

    const me = await Instructor.findByIdAndUpdate(req.uId, 
        { 
            $set: { 
                firstName: value.firstName, 
                lastName: value.lastName,
                university: value.university
            }
        }, { new: true }).select('-_id -email -courses');

    return res.status(200).json({ status_message: 'Success', me: me });
});

/* Deletes the account of the current instructor */
router.delete('/', authInstructor, async (req, res) => {

    await Instructor.findByIdAndDelete(req.uId);
    await admin.auth().deleteUser(req.uId);

    return res.status(200).json({ status_message: 'Success' });
});

/* Gets the courses of the current instructor */
router.get('/courses', authInstructor, async (req, res) => {

    const me = await Instructor.findById(req.uId);
    const courses = await Course.find({ _id: { $in: me.courses } });
    return res.status(200).json({ status_message: 'Success', courses: courses });
});

module.exports = router;