const { Student, validate } = require('../models/student');

const auth = require('../middleware/auth');

const meRouter = require('./studentsMe');

const config = require('config');
const admin = require(config.get('firebaseAdmin'));
const express = require('express');
const router = express.Router();

router.use('/me', meRouter);

/* This endpoint is for signing up a new student on our database and setting the student permission */
router.post('/signup', auth, async (req, res) => {
    const { error, value } = validate(req.body);
    if (error) return res.status(400).json({ status_message: 'Bad Request: ' + error.details[0].message });

    // Sign up the user as a student
    await admin.auth().setCustomUserClaims(req.uId, { role: 0 });

    // Get user details from firebase
    const user = await admin.auth().getUser(req.uId);

    const student = new Student({
        _id: req.uId,
        firstName: value.firstName,
        lastName: value.lastName,
        studentId: value.studentId,
        university: value.university,
        email: user.email
    });

    await student.save();
    return res.status(200).json({ status_message: 'Success' });
});

module.exports = router;