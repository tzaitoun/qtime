const { Question, validate, validateQuestionType } = require('../models/question');

const authInstructor = require('../middleware/authInstructor');
const authCourse = require('../middleware/authCourse');

const mongoose = require('mongoose');
const express = require('express');
const router = express.Router({ mergeParams: true });

/* This endpoint allows an instructor to create a new question in their course */
router.post('/', [authInstructor, authCourse], async (req, res) => {
    const { error, value } = validate(req.body);
    if (error) return res.status(400).json({ status_message: 'Bad Request: ' + error.details[0].message });

    // This validates the question details depending on the type of the question
    const questionDetails = validateQuestionType(value.type, value.questionDetails);
    if (questionDetails.error) return res.status(400).json({ status_message: 'Bad Request: ' + questionDetails.error.details[0].message });

    const question = new Question({
        title: value.title,
        type: value.type,
        question: value.question,
        mark: value.mark,
        participationMark: value.participationMark,
        course: req.course._id,
        questionDetails: questionDetails.value
    });

    await question.save();

    return res.status(200).json({ status_message: 'Success', question: question });
});

/* This endpoint allows an instructor to edit a question in their course */
router.put('/:questionId', [authInstructor, authCourse], async (req, res) => {

    // Check if question id is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.questionId)) {
        return res.status(404).json({ status_message: 'Not found: Question not found' });
    }

    const { error, value } = validate(req.body);
    if (error) return res.status(400).json({ status_message: 'Bad Request: ' + error.details[0].message });

    // This validates the question details depending on the type of the question
    const questionDetails = validateQuestionType(value.type, value.questionDetails);
    if (questionDetails.error) return res.status(400).json({ status_message: 'Bad Request: ' + questionDetails.error.details[0].message });

    const question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).json({ status_message: 'Not found: Question not found' });
    if (question.deployed) return res.status(400).json({ status_message: 'Bad Request: Cannot edit a deployed question' });

    // Update the question values
    question.title = value.title;
    question.type = value.type;
    question.question = value.question;
    question.mark = value.mark;
    question.participationMark = value.participationMark;
    question.questionDetails = questionDetails.value;
    await question.save();

    return res.status(200).json({ status_message: 'Success', question: question });
});

/* This endpoint allows an instructor to delete a question in their course */
router.delete('/:questionId', [authInstructor, authCourse], async (req, res) => {

    // Check if question id is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.questionId)) {
        return res.status(404).json({ status_message: 'Not found: Question not found' });
    }

    const question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).json({ status_message: 'Not found: Question not found' });
    if (question.deployed) return res.status(400).json({ status_message: 'Bad Request: Cannot delete a deployed question' });

    // Delete the question if it was not deployed
    await Question.findByIdAndDelete(req.params.questionId);

    return res.status(200).json({ status_message: 'Success', question: question });
});

/* This endpoint allows an instructor to get a question in their course */
router.get('/:questionId', [authInstructor, authCourse], async (req, res) => {
    
    // Check if question id is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.questionId)) {
        return res.status(404).json({ status_message: 'Not found: Question not found' });
    }

    const question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).json({ status_message: 'Not found: Question not found' });

    return res.status(200).json({ status_message: 'Success', question: question });
});

/* This endpoint allows an instructor to get all questions in their course */
router.get('/', [authInstructor, authCourse], async (req, res) => {

    const questions = await Question.find({ course: req.course._id });
    return res.status(200).json({ status_message: 'Success', questions: questions });
});

module.exports = router;