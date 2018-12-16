const { Student } = require('../models/student');
const { Question } = require('../models/question');

const authInstructor = require('../middleware/authInstructor');
const authCourse = require('../middleware/authCourse');

const mongoose = require('mongoose');
const express = require('express');
const router = express.Router({ mergeParams: true });

/* Gets the details of all students in the course */
router.get('/', [authInstructor, authCourse], async (req, res) => {

    const students = await Student.find({ courses: req.course._id });
    return res.status(200).json({ status_message: 'Success', students: students });
});

router.get('/:studentId/grades', [authInstructor, authCourse], async (req, res) => {

    const courseId = req.course._id;
    const studentId = req.params.studentId;

    // Check if the student exists 
    const student = await Student.findById(studentId);
    if (!student) {
        return res.status(404).json({ status_message: 'Not found: Student not found' });
    }

    const isEnrolled = student.courses.some(function(cId) {
        return cId.equals(courseId);
    });

    if (!isEnrolled) return res.status(403).json({ status_message: 'Forbidden: You do not have permission to access this student' });

    const grades = await Question.aggregate()
        .match({ course: courseId, deployed: true })
        .lookup({ from: 'answers', localField: '_id', foreignField: 'question', as: 'grade' })
        .unwind('grade')
        .match({ 'grade.student': student._id })
        .exec();
    
    return res.status(200).json({ status_message: 'Success', results: grades });
});

module.exports = router;