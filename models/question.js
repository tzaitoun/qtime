const mongoose = require('mongoose');
const Joi = require('joi');

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 30
    },
    type: {
        type: String,
        required: true,
    },
    question: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 100
    },
    mark: {
        type: Number,
        required: true
    },
    participationMark: {
        type: Number,
        required: true
    },
    course: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course',
        required: true
    },
    questionDetails: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
});

const Question = mongoose.model('Question', schema);

function validate(req) {
    const schema = {
        title: Joi.string().trim().min(1).max(30).required(),
        type: Joi.string().valid(['Multiple Choice', 'Fill in the Blanks', 'Numeric Answer']).required(),
        question: Joi.string().trim().min(1).max(100).required(),
        mark: Joi.number().required(),
        participationMark: Joi.number().required(),
        questionDetails: Joi.object().required()
    };

    return Joi.validate(req, schema);
}

function validateFIB(questionDetails) {
    const schema = {
        answers: Joi.array().items(Joi.string().required()),
    };

    return Joi.validate(questionDetails, schema);
}

function validateMultipleChoice(questionDetails) {
    const schema = {
        choices: Joi.array().items(Joi.string().required(), Joi.string().required()),
        answer: Joi.number().min(0).less(Joi.ref('choices.length')).required()
    };

    return Joi.validate(questionDetails, schema);
}

function validateNumericAnswer(questionDetails) {
    const schema = {
        answer: Joi.number().required()
    };

    return Joi.validate(questionDetails, schema);
}

module.exports.Question = Question;
module.exports.validate = validate;
module.exports.validateFIB = validateFIB;
module.exports.validateMultipleChoice = validateMultipleChoice;
module.exports.validateNumericAnswer = validateNumericAnswer;