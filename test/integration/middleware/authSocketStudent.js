const { Student } = require('../../../models/student');
const { Instructor } = require('../../../models/instructor');
const { Course } = require('../../../models/course');

const request = require('supertest');
const mocksdk = require('../../firebaseMockSetup');
const { expect } = require('chai');
const shortId = require('shortid');
const io = require('socket.io-client');

describe('authSocket Middleware when the user is a student', () => {

    let server;
    let studentToken;
    let student;
    let instructor;
    let course;

    before(async () => {

        // Get the server object for the main test setup
        server = require('../../testSetup');

        // Create a firebase user who will be a student
        mocksdk.auth().autoFlush();
        mocksdk.auth().createUser({
            uid: '123',
            email: 'student@mail.com',
            password: 'student'
        });

        // Assign the student role
        mocksdk.auth().setCustomUserClaims('123', { role: 0 });

        // Get the user's token
        const user = await mocksdk.auth().getUser('123');
        studentToken = await user.getIdToken();

        // Create a new student in our database
        student = new Student({
            _id: '123',
            firstName: 'Student',
            lastName: 'Test',
            studentId: '123456789',
            university: 'University of Test',
            email: user.email
        });

        await student.save();

        // Create a new instructor and a new course for them
        instructor = new Instructor({
            _id: '12345',
            firstName: 'Instructor',
            lastName: 'Test',
            university: 'University of Test',
            email: 'instructor@mail.com'
        });

        await instructor.save();

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
    });

    after(async () => {
        await Student.deleteMany({});
        await Instructor.deleteMany({});
        await Course.deleteMany({});
    });

    it('should return an authentication error if the user does not provide a token', (done) => {
        
        const socket = io('http://localhost:3000/courses/' + course._id + '/classroom');

        socket.on('error', (error) => {
            expect(error).to.be.equal('Authentication Error');
            done();
        });
    });

    it('should return an authentication error if the user does not provide a valid token', (done) => {
        
        const socket = io('http://localhost:3000/courses/' + course._id + '/classroom?token=123456789');

        socket.on('error', (error) => {
            expect(error).to.be.equal('Authentication Error');
            done();
        });
    });

    it('should return a permission denied error if the user provided a valid token but is not enrolled in the course', (done) => {
        
        const socket = io('http://localhost:3000/courses/' + course._id + '/classroom?token=' + studentToken);

        socket.on('error', (error) => {
            expect(error).to.be.equal('Permission Denied Error');
            done();
        });
    });

    it('should connect successfully if the user provided a valid token and is enrolled in the course', async () => {

        student.courses.push(course._id);
        await student.save();
        
        const socket = io('http://localhost:3000/courses/' + course._id + '/classroom?token=' + studentToken);

        socket.on('connect', () => {
            return Promise.resolve();
        });
    });
});