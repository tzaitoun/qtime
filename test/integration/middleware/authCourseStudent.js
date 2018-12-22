const { Student } = require('../../../models/student');
const { Course } = require('../../../models/course');

const shortId = require('shortid');
const mongoose = require('mongoose');
const request = require('supertest');
const mocksdk = require('../../firebaseMockSetup');
const { expect } = require('chai');

describe('authCourse Middleware when the user is a student', () => {

    let server;
    let token;
    let student;
    let course;

    before(async () => {

        // Get the server object for the main test setup
        server = require('../../testSetup');

        // Create a firebase user
        mocksdk.auth().autoFlush();
        mocksdk.auth().createUser({
            uid: '123',
            email: 'test@mail.com',
            password: 'test'
        });

        // Assign the student role to the user
        mocksdk.auth().setCustomUserClaims('123', { role: 0 });

        // Get the user's token
        const user = await mocksdk.auth().getUser('123');
        token = await user.getIdToken();

        student = new Student({
            _id: '123',
            firstName: 'Student',
            lastName: 'Test',
            studentId: '123456789',
            university: 'University of Test',
            email: user.email
        });

        await student.save();

        course = new Course({
            name: 'Intro to Algorithms',
            code: 'CSC200',
            joinCode: shortId.generate(),
            courseOwner: {
                _id: '12345',
                firstName: 'Instructor',
                lastName: 'Test'
            }
        });

        await course.save();
    });

    after(async () => {
        await Student.deleteMany({});
        await Course.deleteMany({});
    });

    it('should return 404 if the course id is not valid', async () => {
        const res = await request(server)
            .get('/courses/' + '123' + '/grades')
            .set('Authorization', 'Bearer ' + token);

        expect(res.status).to.be.equal(404);
    });

    it('should return 404 if the course does not exist', async () => {
        const courseId = mongoose.Types.ObjectId().toHexString();
        const res = await request(server)
            .get('/courses/' + courseId + '/grades')
            .set('Authorization', 'Bearer ' + token);

        expect(res.status).to.be.equal(404);
    });

    it('should return 403 if the student is not enrolled in the course', async () => {
        const res = await request(server)
            .get('/courses/' + course._id + '/grades')
            .set('Authorization', 'Bearer ' + token);

        expect(res.status).to.be.equal(403);
    });

    it('should return 200 if the student is enrolled in the course', async () => {
        student.courses.push(course._id);
        await student.save();
        
        const res = await request(server)
            .get('/courses/' + course._id + '/grades')
            .set('Authorization', 'Bearer ' + token);

        expect(res.status).to.be.equal(200);
    });
});