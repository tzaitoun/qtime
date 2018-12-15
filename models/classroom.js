const mongoose = require('mongoose');
const Joi = require('joi');

/* This model represents the real-time virtual classroom, each course has one classroom entry and is updated when the instructor deploys
 * a question or stops accepting answers for the question. The "active" field specifies if there is a question being asked right now,
 * the "question" field stores the question being asked, and "studentsAnswered" keeps track of how many students answered the question.
 */
const schema = new mongoose.Schema({
    active: {
        type: Boolean,
        required: true
    },
    question: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    studentsAnswered: {
        type: Number,
        default: 0
    }
});

const Classroom = mongoose.model('Classroom', schema);

function validate(req) {
    const schema = {
        questionId: Joi.objectId().required()
    };

    return Joi.validate(req, schema);
}

module.exports.Classroom = Classroom;
module.exports.validate = validate;