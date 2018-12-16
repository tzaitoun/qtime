const mongoose = require('mongoose');
const Joi = require('joi');

/* This model represents a student's answer and grade to a question. */
const schema = new mongoose.Schema({
    student: {
        type: String,
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course',
        required: true
    },
    question: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Question',
        required: true
    },
    mark: {
        type: Number,
        required: true
    },
    participationMark: {
        type: Number,
        required: true
    },
    answer: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
});

const Answer = mongoose.model('Answer', schema);

function validateAnswer(req) {
    const schema = {
        questionId: Joi.objectId().required(),
        answer: Joi.object().required()
    };

    return Joi.validate(req, schema);
}

/* Each question type will have a different answer structure, so this function is used to validate each answer type. These are 
 * used to validate the incoming request.
 */
function validateAnswerType(question, answer) {
    switch(question.type) {
        case 'Fill in the Blanks':
            return validateFIB(answer, question.questionDetails);
        case 'Multiple Choice':
            return validateMultipleChoice(answer, question.questionDetails);
        case 'NumericAnswer':
            return validateNumericAnswer(answer);
    } 
}

function validateFIB(answer, questionDetails) {
    const schema = {
        answers: Joi.array().items(Joi.string()).length(questionDetails.answers.length).required(),
    };

    return Joi.validate(answer, schema);
}

function validateMultipleChoice(answer, questionDetails) {
    const schema = {
        answer: Joi.number().min(0).less(questionDetails.choices.length).required()
    };

    return Joi.validate(answer, schema);
}

function validateNumericAnswer(answer) {
    const schema = {
        answer: Joi.number().required()
    };

    return Joi.validate(answer, schema);
}

/* Each question type will have a different answer structure, so this function is used to calculate the mark for each answer type. */
function calculateMark(question, answer) {
    switch(question.type) {
        case 'Fill in the Blanks':
            return calculateMarkFIB(question, answer);
        case 'Multiple Choice':
            return calculateMarkMultipleChoice(question, answer);
        case 'NumericAnswer':
            return calculateMarkNumericAnswer(question, answer);
    }
}

function calculateMarkFIB(question, sAnswer) {
    const qAnswers = question.questionDetails.answers;
    const markPerAnswer = question.mark / qAnswers.length;

    let totalMark = 0;

    for (let i = 0; i < qAnswers.length; i++) {
        if (qAnswers[i].equals(sAnswer.answers[i])) {
            totalMark += markPerAnswer;
        }
    }

    return totalMark;
}

function calculateMarkMultipleChoice(question, sAnswer) {
    const qAnswer = question.questionDetails.answer;

    if (qAnswer === sAnswer.answer) {
        return question.mark;
    } else {
        return 0;
    }
}

function calculateMarkNumericAnswer(question, sAnswer) {
    const qAnswer = question.questionDetails.answer;

    if (qAnswer === sAnswer.answer) {
        return question.mark;
    } else {
        return 0;
    }
}

module.exports.Answer = Answer;
module.exports.validateAnswer = validateAnswer;
module.exports.validateAnswerType = validateAnswerType;
module.exports.calculateMark = calculateMark;
