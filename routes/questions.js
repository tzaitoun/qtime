const { Question, validate } = require('../models/question');
const { validateFIB, validateMultipleChoice, validateNumericAnswer } = require('../models/question');

const authInstructor = require('../middleware/authInstructor');
const authCourse = require('../middleware/authCourse');

const express = require('express');
const router = express.Router({ mergeParams: true });

/* This endpoint allows an instructor to create a new question in their course */
router.post('/', [authInstructor, authCourse], async (req, res) => {
    const { error, value } = validate(req.body);
    if (error) return res.status(400).json({ status_message: 'Bad Request: ' + error.details[0].message });

    // This validates the question details depending on the type of the question
    const questionDetails = validateQuestionType(req.body.type, req.body.questionDetails);
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

/* Each question type will have a different question details, so this function is used to validate each question type */
function validateQuestionType(questionType, questionDetails) {
    switch(questionType) {
        case 'Fill in the Blanks':
            return validateFIB(questionDetails);
        case 'Multiple Choice':
            return validateMultipleChoice(questionDetails);
        case 'NumericAnswer':
            return validateNumericAnswer(questionDetails);
    } 
}

module.exports = router;