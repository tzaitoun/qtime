const Instructor = require('../models/instructor');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('firebase-admin');

router.post('/', auth, async (req, res) => {
    const { error } = validate(req);
    if (error) return res.status(400).json({ message: error.details[0].message });

    let instructor = await Instructor.findOne({ userId: req.uId });
    if (instructor) return res.status(400).json({ message: 'User is already registered' });

    await admin.auth().setCustomUserClaims(req.uid, { role: 1 });

    instructor = new Instructor({
        userId: req.uId,
        firstName: req.firstName,
        lastName: req.lastName,
        university: req.university
    });

    await instructor.save();
    return res.status(200).json({ message: 'Success' });
});

function validate(req) {
    const schema = {
        firstName: Joi.string().min(1).max(30).required(),
        lastName: Joi.string().min(1).max(30).required(),
        university: Joi.string().min(1).max(30).required()
    };

    return Joi.validate(req, schema);
}

module.exports = router;