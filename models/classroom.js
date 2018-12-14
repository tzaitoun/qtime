const mongoose = require('mongoose');
const Joi = require('joi');

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