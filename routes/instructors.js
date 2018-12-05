const Instructor = require('../models/instructor');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('firebase-admin');

router.post('/', auth, async (req, res) => {
    const { error, value } = validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    await admin.auth().setCustomUserClaims(req.uId, { role: 1 });

    let instructor = new Instructor({
        userId: req.uId,
        firstName: value.firstName,
        lastName: value.lastName,
        university: value.university
    });

    await instructor.save();
    return res.status(200).json({ message: 'Success' });
});

function validate(req) {
    const schema = {
        firstName: Joi.string().trim().min(1).max(30).required(),
        lastName: Joi.string().trim().min(1).max(30).required(),
        university: Joi.string().trim().min(1).max(30).required()
    };

    return Joi.validate(req, schema);
}

module.exports = router;