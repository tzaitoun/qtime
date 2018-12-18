const { Instructor, validate } = require('../models/instructor');

const auth = require('../middleware/auth');

const meRouter = require('./instructorsMe');

const config = require('config');
const admin = require(config.get('firebaseAdmin'));
const express = require('express');
const router = express.Router();

router.use('/me', meRouter);

/* This endpoint is for signing up a new instructor on our database and setting the instructor permission */
router.post('/signup', auth, async (req, res) => {
    const { error, value } = validate(req.body);
    if (error) return res.status(400).json({ status_message: 'Bad Request: ' + error.details[0].message });

    // Sign up the user as an instructor
    await admin.auth().setCustomUserClaims(req.uId, { role: 1 });
    
    // Get user details from firebase
    const user = await admin.auth().getUser(req.uId);

    const instructor = new Instructor({
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