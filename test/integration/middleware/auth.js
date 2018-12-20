const { Student } = require('../../../models/student');

const request = require('supertest');
const mocksdk = require('../../firebaseMockSetup');
const { expect } = require('chai');

describe('auth Middleware', () => {

    let server;
    let token;

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

        // Get the user's token
        const user = await mocksdk.auth().getUser('123');
        token = await user.getIdToken();
    });

    after(async () => {
        await Student.deleteMany({});
    });

    it('should return 400 if the header has no Authorization field', async () => {
        const res = await request(server)
            .post('/students/signup')
            .send({
                firstName: 'test',
                lastName: 'test',
                studentId: '123456789',
                university: 'University of Test'
            });

        expect(res.status).to.be.equal(400);
    });

    it('should return 400 if the Authorization field does not use a Bearer scheme', async () => {
        const res = await request(server)
            .post('/students/signup')
            .set('Authorization', token)
            .send({
                firstName: 'test',
                lastName: 'test',
                studentId: '123456789',
                university: 'University of Test'
            });

        expect(res.status).to.be.equal(400);
    });

    it('should return 400 if a token is not provided', async () => {
        const res = await request(server)
            .post('/students/signup')
            .set('Authorization', 'Bearer ')
            .send({
                firstName: 'test',
                lastName: 'test',
                studentId: '123456789',
                university: 'University of Test'
            });

        expect(res.status).to.be.equal(400);
    });

    it('should return 401 if the token is not valid', async () => {
        const res = await request(server)
            .post('/students/signup')
            .set('Authorization', 'Bearer ' + 123456789)
            .send({
                firstName: 'test',
                lastName: 'test',
                studentId: '123456789',
                university: 'University of Test'
            });

        expect(res.status).to.be.equal(401);
    });

    it('should return 200 if the token is valid', async () => {
        const res = await request(server)
            .post('/students/signup')
            .set('Authorization', 'Bearer ' + token)
            .send({
                firstName: 'test',
                lastName: 'test',
                studentId: '123456789',
                university: 'University of Test'
            });

        expect(res.status).to.be.equal(200);
    }); 
});