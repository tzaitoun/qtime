const { Instructor } = require('../../../models/instructor');
const { Student } = require('../../../models/student');
const { Course } = require('../../../models/course');

const shortId = require('shortid');
const request = require('supertest');
const mocksdk = require('../../firebaseMockSetup');
const { expect } = require('chai');

describe('courses endpoint', () => {

    let server;
    let token;
    let instructor;

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

        // Assign the instructor role
        mocksdk.auth().setCustomUserClaims('123', { role: 1 });

        // Get the user's token
        const user = await mocksdk.auth().getUser('123');
        token = await user.getIdToken();

        instructor = new Instructor({
            _id: '123',
            firstName: 'Instructor',
            lastName: 'Test',
            university: 'University of Test',
            email: user.email
        });

        await instructor.save();
    });

    after(async () => {
        await Instructor.deleteMany({});
        await Student.deleteMany({});
        await Course.deleteMany({});
    });

    describe('POST / endpoint', () => {

        it('should return 400 if no course name is provided', async () => {
            const res = await request(server)
                .post('/courses')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    code: 'CSC343'
                });

            expect(res.status).to.be.equal(400);
        });

        it('should return 200 if request is valid', async () => {
            const res = await request(server)
                .post('/courses')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    name: 'Intro to Databases',
                    code: 'CSC343'
                });

            expect(res.status).to.be.equal(200);
            expect(res.body.course.courseOwner._id).to.be.equal(instructor._id);
        });
    });

    describe('PUT /:courseId endpoint', () => {

        let course;

        before(async () => {
            course = new Course({
                name: 'Intro to Math',
                code: 'MAT100',
                joinCode: shortId.generate(),
                courseOwner: {
                    _id: instructor._id,
                    firstName: instructor.firstName,
                    lastName: instructor.lastName
                }
            });

            await course.save();

            instructor = await Instructor.findById(instructor._id);
            instructor.courses.push(course._id);
            await instructor.save();
        });

        it('should return 400 if no course name is provided', async () => {
            const res = await request(server)
                .put('/courses/' + course._id)
                .set('Authorization', 'Bearer ' + token)
                .send({
                    code: 'MAT100'
                });

            expect(res.status).to.be.equal(400);
        });

        it('should return 200 and the updated course if request is valid', async () => {
            const res = await request(server)
                .put('/courses/' + course._id)
                .set('Authorization', 'Bearer ' + token)
                .send({
                    name: 'Intro to Math',
                    code: 'MAT105'
                });

            expect(res.status).to.be.equal(200);
            expect(res.body.course.code).to.be.equal('MAT105');
        });
    });

    describe('POST /join endpoint', () => {

        let course;
        let student;
        let studentToken;
        const joinCode = shortId.generate();

        before(async () => {

            // Create a firebase user
            mocksdk.auth().autoFlush();
            mocksdk.auth().createUser({
                uid: '12345',
                email: 'test12345@mail.com',
                password: 'test'
            });

            // Assign the student role
            mocksdk.auth().setCustomUserClaims('12345', { role: 0 });

            // Get the user's token
            const user = await mocksdk.auth().getUser('12345');
            studentToken = await user.getIdToken();

            student = new Student({
                _id: '12345',
                firstName: 'Student',
                lastName: 'Test',
                studentId: '123456789',
                university: 'University of Test',
                email: user.email
            });

            await student.save();

            course = new Course({
                name: 'Intro to Science',
                code: 'SCI100',
                joinCode: joinCode,
                courseOwner: {
                    _id: instructor._id,
                    firstName: instructor.firstName,
                    lastName: instructor.lastName
                }
            });

            await course.save();
        });

        it('should return 400 if no join code is provided', async () => {
            const res = await request(server)
                .post('/courses/join')
                .set('Authorization', 'Bearer ' + studentToken)
                .send({});

            expect(res.status).to.be.equal(400);
        });

        it('should return 400 if join code is invalid', async () => {
            const res = await request(server)
                .post('/courses/join')
                .set('Authorization', 'Bearer ' + studentToken)
                .send({
                    joinCode: '123344221'
                });

            expect(res.status).to.be.equal(400);
        });

        it('should return 400 if no course exists with provided join code', async () => {
            const res = await request(server)
                .post('/courses/join')
                .set('Authorization', 'Bearer ' + studentToken)
                .send({
                    joinCode: shortId.generate()
                });

            expect(res.status).to.be.equal(400);
        });

        it('should return 200 if join code is valid', async () => {
            const res = await request(server)
                .post('/courses/join')
                .set('Authorization', 'Bearer ' + studentToken)
                .send({
                    joinCode: joinCode
                });

            expect(res.status).to.be.equal(200);
            expect(res.body.course._id).to.be.equal(course._id.toString());
        });

        it('should return 400 if student is already enrolled', async () => {
            const res = await request(server)
                .post('/courses/join')
                .set('Authorization', 'Bearer ' + studentToken)
                .send({
                    joinCode: joinCode
                });

            expect(res.status).to.be.equal(400);
            expect(res.body.status_message).to.be.equal('Bad request: You are already enrolled in this course');
        });
    });
});