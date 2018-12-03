const Student = require('../models/student');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('firebase-admin');

router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    let student = await Student.findOne({ userId: req.uId });
    if (student) return res.status(400).json({ message: 'User is already registered' });

    await admin.auth().setCustomUserClaims(req.uid, { role: 0 });

    student = new Student({
        userId: req.uId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        studentId: req.body.studentId,
        university: req.body.university
    });

    await student.save();
    return res.status(200).json({ message: 'Success' });
});

function validate(req) {
    const schema = {
        firstName: Joi.string().min(1).max(30).required(),
        lastName: Joi.string().min(1).max(30).required(),
        studentId: Joi.string().min(1).max(30).required(),
        university: Joi.string().min(1).max(30).required()
    };

    return Joi.validate(req, schema);
}

module.exports = router;