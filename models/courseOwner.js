const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 30
    },
    lastName: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 30
    }
});

module.exports = schema;