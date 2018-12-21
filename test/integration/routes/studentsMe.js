const { Student } = require('../../../models/student');
const { Course } = require('../../../models/course');

const shortId = require('shortid');
const request = require('supertest');
const mocksdk = require('../../firebaseMockSetup');
const { expect } = require('chai');

describe('students/me endpoint', () => {

    let server;
    let token;
    let user;
    let student;

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

        // Assign student role to user
        mocksdk.auth().setCustomUserClaims('123', { role: 0 });

        // Get the user's token
        user = await mocksdk.auth().getUser('123');
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
    });

    after(async () => {
        await Student.deleteMany({});
        await Course.deleteMany({});
    });

    describe('GET / endpoint', () => {
        
        it('should return 200 and the student', async () => {
            const res = await request(server)
                .get('/students/me')
                .set('Authorization', 'Bearer ' + token);

        expect(res.status).to.be.equal(200);
        expect(res.body.me.firstName).to.be.equal('Student');
        });
    });

    describe('PUT / endpoint', () => {

        it('should return 400 if firstName is not defined', async () => {
            const res = await request(server)
                .put('/students/me')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    lastName: 'Test',
                    studentId: '123456789',
                    university: 'University of Test'
                });
            
            expect(res.status).to.be.equal(400);
        });

        it('should return 200 if request is valid and the updated student id', async () => {
            const res = await request(server)
                .put('/students/me')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    firstName: 'Student',
                    lastName: 'Test',
                    studentId: '999',
                    university: 'University of Test'
                });
            
            expect(res.status).to.be.equal(200);
            expect(res.body.me.studentId).to.be.equal('999');
        });
    });

    describe('GET /courses', () => {

        it('should return 200 and the student\'s courses', async () => {

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

            student.courses.push(course._id);
            await student.save();
            
            const res = await request(server)
                .get('/students/me/courses')
                .set('Authorization', 'Bearer ' + token);
            
            expect(res.status).to.be.equal(200);
            expect(res.body.courses.length).to.be.equal(1);
        });
    });

    describe('DELETE / endpoint', () => {
        
        it('should return 200', async () => {
            const res = await request(server)
                .delete('/students/me')
                .set('Authorization', 'Bearer ' + token);

        expect(res.status).to.be.equal(200);
        });
    });
});