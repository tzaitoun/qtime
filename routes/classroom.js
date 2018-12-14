const { Question } = require('../models/question');
const { Classroom, validate } = require('../models/classroom');
const { Answer, validateAnswer, validateAnswerType, calculateMark } = require('../models/answer');

const authInstructor = require('../middleware/authInstructor');
const authStudent = require('../middleware/authStudent');
const authCourse = require('../middleware/authCourse');

const express = require('express');
const router = express.Router({ mergeParams: true });

/* This endpoint allows an instructor to deploy a question in real-time to the classroom. The question will be sent to all students
 * who subscribed to the "question" event.
 */
router.post('/', [authInstructor, authCourse], async (req, res) => {
    const { error, value } = validate(req.body);
    if (error) return res.status(400).json({ status_message: 'Bad Request: ' + error.details[0].message });

    // Check if the question exists
    const question = await Question.findById(value.questionId);
    if (!question) {
        return res.status(404).json({ status_message: 'Not found: Question not found' });
    }

    // Check if this question belongs to the course
    if (question.course != req.params.courseId) {
        return res.status(403).json({ status_message: 'Forbidden: You do not have permission to access this question' });
    }

    let classroom = await Classroom.findById(req.course._id);

    // Create a new classroom if it doesn't exist or update the existing one
    if (classroom) {
        classroom.active = true;
        classroom.question = question;
        await classroom.save();
    } else {
        classroom = new Classroom({
            _id: req.course._id,
            active: true,
            question: question
        });
        await classroom.save();
    }

    // Emit the question to all students in the "classroom"
    req.nsp.to('students').emit('question', question);
    return res.status(200).json({ status_message: 'Success', question: question });
});

router.post('/close', [authInstructor, authCourse], async (req, res) => {
    const classroom = Classroom.findByIdAndUpdate(req.course._id, 
        {
            $set: {
                active: false,
                studentsAnswered: 0
            }
        }
    );

    return res.status(200).json({ status_message: 'Success' });
});

router.post('/answer', [authStudent, authCourse], async (req, res) => {
    const { error, value } = validateAnswer(req.body);
    if (error) return res.status(400).json({ status_message: 'Bad Request: ' + error.details[0].message });

    // Check if the question exists
    const question = await Question.findById(value.questionId);
    if (!question) {
        return res.status(404).json({ status_message: 'Not found: Question not found' });
    }

    // Check if this question belongs to the course
    if (question.course != req.params.courseId) {
        return res.status(403).json({ status_message: 'Forbidden: You do not have permission to access this question' });
    }

    // Check if the question is still active in the classroom
    const classroom = await Classroom.findById(req.params.courseId);

    if (!classroom.active || !classroom.question._id.equals(question._id)) {
        return res.status(403).json({ status_message: 'Forbidden: You can no longer answer this question' });
    }

     // This validates the answer depending on the type of the question
     const answer = validateAnswerType(question, value.answer);
     if (answer.error) return res.status(400).json({ status_message: 'Bad Request: ' + answer.error.details[0].message });

     const mark = calculateMark(question, answer.value);

     let studentAnswer = await Answer.findOne({ student: req.uId, question: question._id });
     
     if (studentAnswer) {
         studentAnswer.mark = mark;
         studentAnswer.answer = answer.value;
         await studentAnswer.save();
     } else {
         studentAnswer = new Answer({
             student: req.uId,
             course: req.course._id,
             question: question._id,
             mark: mark,
             participationMark: question.participationMark,
             available: false,
             answer: answer.value
         });
         await studentAnswer.save();

         classroom.studentsAnswered++;
         await classroom.save();
         req.nsp.to('instructors').emit('answer', classroom.studentsAnswered);
     }

     return res.status(200).json({ status_message: 'Success' });
});

module.exports = router;