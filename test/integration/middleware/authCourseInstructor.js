const { Instructor } = require('../../../models/instructor');
const { Course } = require('../../../models/course');

const shortId = require('shortid');
const mongoose = require('mongoose');
const request = require('supertest');
const mocksdk = require('../../firebaseMockSetup');
const { expect } = require('chai');

describe('authCourse Middleware when the user is an instructor', () => {

    let server;
    let token;
    let instructor;
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
        mocksdk.auth().setCustomUserClaims('123', { role: 1 });

        // Get the user's token
        const user = await mocksdk.auth().getUser('123');
        token = await user.getIdToken();

        instructor = new Instructor({
            _id: '123',
            firstName: 'Student',
            lastName: 'Test',
            university: 'University of Test',
            email: user.email
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
        await Instructor.deleteMany({});
        await Course.deleteMany({});
    });

    it('should return 404 if the course id is not valid', async () => {
        const res = await request(server)
            .get('/courses/' + '123' + '/students')
            .set('Authorization', 'Bearer ' + token);

        expect(res.status).to.be.equal(404);
    });

    it('should return 404 if the course does not exist', async () => {
        const courseId = mongoose.Types.ObjectId().toHexString();
        const res = await request(server)
            .get('/courses/' + courseId + '/students')
            .set('Authorization', 'Bearer ' + token);

        expect(res.status).to.be.equal(404);
    });

    it('should return 403 if the instructor is not enrolled in the course', async () => {
        const res = await request(server)
            .get('/courses/' + course._id + '/students')
            .set('Authorization', 'Bearer ' + token);

        expect(res.status).to.be.equal(403);
    });

    it('should return 200 if the instructor is enrolled in the course', async () => {
        instructor.courses.push(course._id);
        await instructor.save();
        
        const res = await request(server)
            .get('/courses/' + course._id + '/students')
            .set('Authorization', 'Bearer ' + token);

        expect(res.status).to.be.equal(200);
    });
});