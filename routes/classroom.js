const { Question } = require('../models/question');
const { Classroom, validate } = require('../models/classroom');
const { Answer, validateAnswer, validateAnswerType, calculateMark } = require('../models/answer');

const authInstructor = require('../middleware/authInstructor');
const authStudent = require('../middleware/authStudent');
const authCourse = require('../middleware/authCourse');

const express = require('express');
const router = express.Router({ mergeParams: true });

/* This endpoint allows an instructor to deploy a question in real-time to the classroom. The question will be sent to all students
 * who subscribed to the "question" event. It also creates/updates the metadata of the classroom.
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
    if (question.course != req.course._id) {
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

/* This endpoint allows the instructor to stop accepting answers for a question. It also updates the metadata of the classroom,
 * it puts the classroom in an inactive state and resets the studentsAnswered field. It also makes the grades for the question
 * available to the students.
 */
router.post('/close', [authInstructor, authCourse], async (req, res) => {
    
    // Put the classroom in the inactive state and reset all fields
    const classroom = Classroom.findByIdAndUpdate(req.course._id, 
        {
            $set: {
                active: false,
                studentsAnswered: 0,
            }
        }
    );

    // Make the marks/answers avaiable to students 
    await Answer.updateMany({ question: classroom.question._id }, { $set: { available: true } });

    return res.status(200).json({ status_message: 'Success' });
});

/* This endpoint allows students to submit their answer (they can also change their answer). It also marks the answer
 * and notifies the instructors in the classroom that a student has submited an asnwer.
 */
router.post('/answer', [authStudent, authCourse], async (req, res) => {
    const { error, value } = validateAnswer(req.body);
    if (error) return res.status(400).json({ status_message: 'Bad Request: ' + error.details[0].message });

    // Check if the question exists
    const question = await Question.findById(value.questionId);
    if (!question) {
        return res.status(404).json({ status_message: 'Not found: Question not found' });
    }

    // Check if this question belongs to the course
    if (question.course != req.course._id) {
        return res.status(403).json({ status_message: 'Forbidden: You do not have permission to access this question' });
    }

    // Check if the question is still active in the classroom
    const classroom = await Classroom.findById(req.course._id);

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

         // If this is the first time submitting an answer, increment studentAnswered and notify the instructors 
         classroom.studentsAnswered++;
         await classroom.save();
         req.nsp.to('instructors').emit('answer', classroom.studentsAnswered);
     }

     return res.status(200).json({ status_message: 'Success' });
});

module.exports = router;