const { Instructor } = require('../models/instructor');
const { Student } = require('../models/student');
const { Course } = require('../models/course');

const mongoose = require('mongoose');

module.exports = async function(req, res, next) {
    
    const courseId = req.params.courseId;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(404).json({ status_message: 'Not found: Course not found' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ status_message: 'Not found: Course not found' });
    }

    let isEnrolled = false;
    if (req.role === 0) {
        const student = await Student.findById(req.uId);
        isEnrolled = student.courses.some(function(courseId) {
            return courseId.equals(course._id);
        });
    } else if (req.role === 1) {
        const instructor = await Instructor.findById(req.uId);
        isEnrolled = instructor.courses.some(function(courseId) {
            return courseId.equals(course._id);
        });
    }

    if (!isEnrolled) return res.status(403).json({ status_message: 'Forbidden: You do not have permission to access this course'});

    req.course = course;
    next();
}