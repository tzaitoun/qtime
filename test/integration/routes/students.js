const { Student } = require('../../../models/student');

const request = require('supertest');
const mocksdk = require('../../firebaseMockSetup');
const { expect } = require('chai');

describe('students/signup endpoint', () => {

    let server;
    let token;
    let user;

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
        user = await mocksdk.auth().getUser('123');
        token = await user.getIdToken();
    });

    after(async () => {
        await Student.deleteMany({});
    });

    it('should return 400 if the request does not include firstName', async () => {
        const res = await request(server)
            .post('/students/signup')
            .set('Authorization', 'Bearer ' + token)
            .send({
                lastName: 'Test',
                studentId: '123456789',
                university: 'University of Test'
            });

        expect(res.status).to.be.equal(400);
    }); 

    it('should return 200 if the token is valid and the role should be set to 0 (student)', async () => {
        const res = await request(server)
            .post('/students/signup')
            .set('Authorization', 'Bearer ' + token)
            .send({
                firstName: 'Student',
                lastName: 'Test',
                studentId: '123456789',
                university: 'University of Test'
            });

        user = await mocksdk.auth().getUser('123');
        expect(res.status).to.be.equal(200);
        expect(user.customClaims.role).to.be.equal(0);
    }); 
});