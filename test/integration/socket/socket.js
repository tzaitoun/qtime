const { Instructor } = require('../../../models/instructor');
const { Student } = require('../../../models/student');
const { Course } = require('../../../models/course');
const { Question } = require('../../../models/question');
const { Classroom } = require('../../../models/classroom');

const request = require('supertest');
const mocksdk = require('../../firebaseMockSetup');
const { expect } = require('chai');
const shortId = require('shortid');
const io = require('socket.io-client');

/* These tests are not that good but will be fixed when I learn more about mocha and how to test event listeners */
describe('classroom socket', () => {

    let server;

    // Instructor related variables
    let instructor;
    let instToken;
    let course;
    let question;

    let student1;
    let studToken1;

    before(async () => {
        // Get the server object for the main test setup
        server = require('../../testSetup');

        let user;

        // Create an instructor and get their token
        instructor = await createInstructor('1');
        user = await mocksdk.auth().getUser('1');
        instToken = await user.getIdToken();

        // Create a course
        course = new Course({
            name: 'Intro to Algorithms',
            code: 'CSC200',
            joinCode: shortId.generate(),
            courseOwner: {
                _id: instructor._id,
                firstName: instructor.firstName,
                lastName: instructor.lastName
            }
        });

        await course.save();

        // Create a question and assign it to the course
        question = new Question({
            title: 'Lesson 1',
            type: 'Multiple Choice',
            question: 'What is 5+5?',
            mark: 2,
            participationMark: 0,
            course: course._id,
            questionDetails: {
                choices: ['10', '5', '0', '1'],
                answer: 0
            }
        });
        
        await question.save();

        // Create a student
        student1 = await createStudent('2');
        user = await mocksdk.auth().getUser('2');
        studToken1 = await user.getIdToken();

        // Enroll the instructors and students in the course
        instructor.courses.push(course._id);
        await instructor.save();
        student1.courses.push(course._id);
        await student1.save();
    });

    after(async () => {
        await Instructor.deleteMany({});
        await Student.deleteMany({});
        await Course.deleteMany({});
        await Question.deleteMany({});
        await Classroom.deleteMany({});
    });

    it('student should recieve the question if they joined the classroom after it was deployed', async () => {

        let res = await request(server)
            .post('/courses/' + course._id + '/classroom')
            .set('Authorization', 'Bearer ' + instToken)
            .send({
                questionId: question._id
            });
        
        expect(res.status).to.be.equal(200);
        
        studSock1 = io('http://localhost:3000/courses/' + course._id + '/classroom?token=' + studToken1);
        studSock1.on('question', (q) => {
            console.log(q);
            expect(q._id).to.be.equal(question._id.toString());
        });
    });

    it('student should recieve the question if they joined the classroom before it was deployed', async () => {

        studSock1 = io('http://localhost:3000/courses/' + course._id + '/classroom?token=' + studToken1);
        studSock1.on('question', (q) => {
            console.log(q);
            expect(q._id).to.be.equal(question._id.toString());
        });

        const res = await request(server)
            .post('/courses/' + course._id + '/classroom')
            .set('Authorization', 'Bearer ' + instToken)
            .send({
                questionId: question._id
            });
        
        expect(res.status).to.be.equal(200);
    });

    it('when a student answers, the instructor should recieve an event of how many students have answered', async () => {

        instSock = io('http://localhost:3000/courses/' + course._id + '/classroom?token=' + instToken);
        instSock.on('answer', (studentsAnswered) => {
            console.log('Students Answered: ' + studentsAnswered);
        });

        const res = await request(server)
            .post('/courses/' + course._id + '/classroom/answer')
            .set('Authorization', 'Bearer ' + studToken1)
            .send({
                questionId: question._id,
                answer: {
                    answer: 0
                }
            });
        
        expect(res.status).to.be.equal(200);
    });
});

function createInstructor(id) {
    const email = 'instructor' + id + '@mail.com';

    // Create a firebase user who will be an instructor
    mocksdk.auth().autoFlush();
    mocksdk.auth().createUser({
        uid: id,
        email: email,
        password: 'password'
    });

    // Assign the instructor role
    mocksdk.auth().setCustomUserClaims(id, { role: 1 });

    // Create a new instructor
    instructor = new Instructor({
        _id: id,
        firstName: 'Instructor',
        lastName: 'Test',
        university: 'University of Test',
        email: email
    });

    return instructor.save();
}  

function createStudent(id) {
    const email = 'student' + id + '@mail.com';

    // Create a firebase user who will be a student
    mocksdk.auth().autoFlush();
    mocksdk.auth().createUser({
        uid: id,
        email: email,
        password: 'password'
    });

    // Assign the student role
    mocksdk.auth().setCustomUserClaims(id, { role: 0 });

    // Create a new student
    student = new Student({
        _id: id,
        firstName: 'Student',
        lastName: 'Test',
        studentId: '123456789',
        university: 'University of Test',
        email: email
    });

    return student.save();
}  