const { Question } = require('../models/question');

const authInstructor = require('../middleware/authInstructor');
const authCourse = require('../middleware/authCourse');

const Joi = require('joi');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router({ mergeParams: true });

/* This endpoint allows an instructor to deploy a question in real-time to the classroom. The question will be sent to all students
 * who subscribed to the "question" event.
 */
router.post('/', [authInstructor, authCourse], async (req, res) => {
    const { error, value } = validate(req.body);
    if (error) return res.status(400).json({ status_message: 'Bad Request: ' + error.details[0].message });

    // Check if the question exists
    const question = await Question.findById(value.questionId);
    if (!question) {
        return res.status(404).json({ status_message: 'Not found: Question not found' });
    }

    // Check if this question belongs to the course
    if (question.course != req.params.courseId) return res.status(403).json({ status_message: 'Forbidden: You do not have permission to access this question'});

    // Emit the question to all students in the "classroom"
    req.nsp.to('students').emit('question', question);
    return res.status(200).json({ status_message: 'Success', question: question });
});

function validate(req) {
    const schema = {
        questionId: Joi.objectId().required()
    };

    return Joi.validate(req, schema);
}

module.exports = router;