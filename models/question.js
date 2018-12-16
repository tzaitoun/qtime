const mongoose = require('mongoose');
const Joi = require('joi');

/* This model represents a question, all questions have the same data except for the question details which is dependent
 * on the type of the question. The deployed field determines if the question has been deployed, which means that the 
 * student got a chance to answer the question, so this field is used to determine if student should be able to see this
 * question's grade.
 */
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
    deployed: {
        type: Boolean,
        required: true,
        default: false
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
module.exports.validateQuestionType = validateQuestionType;