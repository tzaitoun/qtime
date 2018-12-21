const { Instructor } = require('../../../models/instructor');
const { Course } = require('../../../models/course');

const shortId = require('shortid');
const request = require('supertest');
const mocksdk = require('../../firebaseMockSetup');
const { expect } = require('chai');

describe('students/me endpoint', () => {

    let server;
    let token;
    let user;
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

        // Assign instructor role to user
        mocksdk.auth().setCustomUserClaims('123', { role: 1 });

        // Get the user's token
        user = await mocksdk.auth().getUser('123');
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
        await Course.deleteMany({});
    });

    describe('GET / endpoint', () => {
        
        it('should return 200 and the instructor', async () => {
            const res = await request(server)
                .get('/instructors/me')
                .set('Authorization', 'Bearer ' + token);

        expect(res.status).to.be.equal(200);
        expect(res.body.me.firstName).to.be.equal('Instructor');
        });
    });

    describe('PUT / endpoint', () => {

        it('should return 400 if firstName is not defined', async () => {
            const res = await request(server)
                .put('/instructors/me')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    lastName: 'Test',
                    university: 'University of Test'
                });
            
            expect(res.status).to.be.equal(400);
        });

        it('should return 200 if request is valid and the updated instructor name', async () => {
            const res = await request(server)
                .put('/instructors/me')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    firstName: 'InstructorTest',
                    lastName: 'Test',
                    university: 'University of Test'
                });
            
            expect(res.status).to.be.equal(200);
            expect(res.body.me.firstName).to.be.equal('InstructorTest');
        });
    });

    describe('GET /courses', () => {

        it('should return 200 and the instructor\'s courses', async () => {

            course = new Course({
                name: 'Intro to Algorithms',
                code: 'CSC200',
                joinCode: shortId.generate(),
                courseOwner: {
                    _id: '123',
                    firstName: 'Instructor',
                    lastName: 'Test'
                }
            });
    
            await course.save();

            instructor.courses.push(course._id);
            await instructor.save();
            
            const res = await request(server)
                .get('/instructors/me/courses')
                .set('Authorization', 'Bearer ' + token);
            
            expect(res.status).to.be.equal(200);
            expect(res.body.courses.length).to.be.equal(1);
        });
    });

    describe('DELETE / endpoint', () => {
        
        it('should return 200', async () => {
            const res = await request(server)
                .delete('/instructors/me')
                .set('Authorization', 'Bearer ' + token);

        expect(res.status).to.be.equal(200);
        });
    });
});