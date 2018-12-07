const { Student, validate } = require('../models/student');
const { Course } = require('../models/course');

const authStudent = require('../middleware/authStudent');

const admin = require('firebase-admin');
const express = require('express');
const router = express.Router();

router.get('/', authStudent, async (req, res) => {

    const me = await Student.findById(req.uId).select('-_id -email -courses');
    return res.status(200).json({ status_message: 'Success', me: me });
});

router.put('/', authStudent, async (req, res) => {
    const { error, value } = validate(req.body);
    if (error) return res.status(400).json({ status_message: 'Bad Request: ' + error.details[0].message });

    const me = await Student.findByIdAndUpdate(req.uId, 
        { 
            $set: { 
                firstName: value.firstName, 
                lastName: value.lastName,
                studentId: value.studentId,
                university: value.university
            }
        }, { new: true }).select('-_id -email -courses');

    return res.status(200).json({ status_message: 'Success', me: me });
});

router.delete('/', authStudent, async (req, res) => {

    await Student.findByIdAndDelete(req.uId);
    await admin.auth().deleteUser(req.uId);

    return res.status(200).json({ status_message: 'Success' });
});

router.get('/courses', authStudent, async (req, res) => {

    const me = await Student.findById(req.uId);
    const courses = await Course.find({ _id: { $in: me.courses } }).select('-joinCode');
    return res.status(200).json({ status_message: 'Success', courses: courses });
});

module.exports = router;