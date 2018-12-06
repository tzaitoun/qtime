const mongoose = require('mongoose');

const courseOwnerSchema = new mongoose.Schema({
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

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 30
    },
    code: {
        type: String,
        minlength: 1,
        maxlength: 30
    },
    joinCode: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 30
    },
    courseOwner: courseOwnerSchema
});

const Course = mongoose.model('Course', schema);

module.exports = Course;