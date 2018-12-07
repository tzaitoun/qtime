const { Student, validate } = require('../models/student');

const auth = require('../middleware/auth');

const admin = require('firebase-admin');
const express = require('express');
const router = express.Router();

/* This endpoint is for creating a new student on our database and setting the student permission */
router.post('/', auth, async (req, res) => {
    const { error, value } = validate(req.body);
    if (error) return res.status(400).json({ status_message: 'Bad Request: ' + error.details[0].message });

    await admin.auth().setCustomUserClaims(req.uId, { role: 0 });

    const user = await admin.auth().getUser(req.uId);

    let student = new Student({
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