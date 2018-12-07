const { Instructor, validate } = require('../models/instructor');

const auth = require('../middleware/auth');

const admin = require('firebase-admin');
const express = require('express');
const router = express.Router();

/* This endpoint is for creating a new instructor on our database and setting the instructor permission */
router.post('/', auth, async (req, res) => {
    const { error, value } = validate(req.body);
    if (error) return res.status(400).json({ status_message: 'Bad Request: ' + error.details[0].message });

    await admin.auth().setCustomUserClaims(req.uId, { role: 1 });
    
    const user = await admin.auth().getUser(req.uId);

    let instructor = new Instructor({
        _id: req.uId,
        firstName: value.firstName,
        lastName: value.lastName,
        university: value.university,
        email: user.email
    });

    await instructor.save();
    return res.status(200).json({ status_message: 'Success' });
});

module.exports = router;