const { Course, validate, validateJoinCourse } = require('../models/course');
const { Instructor } = require('../models/instructor');
const { Student } = require('../models/student');

const authInstructor = require('../middleware/authInstructor');
const authStudent = require('../middleware/authStudent');

const questionsRouter = require('../routes/questions');
const classroomRouter = require('../routes/classroom');

const shortid = require('shortid');
const express = require('express');
const router = express.Router();

router.use('/:courseId/q', questionsRouter);
router.use('/:courseId/classroom', classroomRouter);

/* This endpoint is for the creation of a new course by an instructor */
router.post('/', authInstructor, async (req, res) => {
    const { error, value } = validate(req.body);
    if (error) return res.status(400).json({ status_message: 'Bad Request: ' + error.details[0].message });

    const instructor = await Instructor.findById(req.uId);

    // Generate a join code to be used by students to join the course
    const joinCode = shortid.generate();

    // Create a new course with the current instructor as the owner
    const course = new Course({
        name: value.name,
        code: value.code,
        joinCode: joinCode,
        courseOwner: {
            _id: instructor._id,
            firstName: instructor.firstName,
            lastName: instructor.lastName
        }
    });

    await course.save();

    // Add the course to the instructor's courses
    instructor.courses.push(course._id);
    await instructor.save();

    return res.status(200).json({ status_message: 'Success' });
});

/* This endpoint allows students to join a course by providing a join code */
router.post('/join', authStudent, async (req, res) => {
    const { error, value } = validateJoinCourse(req.body);
    if (error) return res.status(400).json({ status_message: 'Bad Request: ' + error.details[0].message });

    // Check if the join code is valid
    const joinCode = value.joinCode;
    if (!shortid.isValid(joinCode)) return res.status(400).json({ status_message: 'Bad Request: Invalid join code' });
    
    // Check if a course exists with the provided join code
    const course = await Course.findOne({ joinCode: joinCode }).select('-joinCode');
    if (!course) return res.status(400).json({ status_message: 'Bad Request: Invalid join code' });

    const student = await Student.findById(req.uId);
    
    // Check if the student is already enrolled in the course
    const isStudentEnrolled = student.courses.some(function(courseId) {
        return courseId.equals(course._id);
    });

    if (isStudentEnrolled) return res.status(400).json({ status_message: 'Bad request: You are already enrolled in this course' });
    
    // Add the course to the student's courses 
    student.courses.push(course._id);
    await student.save();

    return res.status(200).json({ status_message: 'Success', course: course });
});

module.exports = router;