const { Question } = require('../models/question');

const authStudent = require('../middleware/authStudent');
const authCourse = require('../middleware/authCourse');

const express = require('express');
const router = express.Router({ mergeParams: true });

/* Gets the grade's of the current student for the course specified in the url */
router.get('/', [authStudent, authCourse], async (req, res) => {

    const grades = await Question.aggregate()
        .match({ course: req.course._id, deployed: true })
        .lookup({ from: 'answers', localField: '_id', foreignField: 'question', as: 'grade' })
        .unwind('grade')
        .match({ 'grade.student': req.uId })
        .exec();
    
    return res.status(200).json({ status_message: 'Success', results: grades });
});

module.exports = router;