const { Student } = require('../../../models/student');

const request = require('supertest');
const mocksdk = require('../../firebaseMockSetup');
const { expect } = require('chai');

describe('authStudent Middleware', () => {

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
            .get('/students/me');

        expect(res.status).to.be.equal(400);
    });

    it('should return 400 if the Authorization field does not use a Bearer scheme', async () => {
        const res = await request(server)
            .get('/students/me')
            .set('Authorization', token);

        expect(res.status).to.be.equal(400);
    });

    it('should return 400 if a token is not provided', async () => {
        const res = await request(server)
            .get('/students/me')
            .set('Authorization', 'Bearer ');

        expect(res.status).to.be.equal(400);
    });

    it('should return 401 if the token is not valid', async () => {
        const res = await request(server)
            .get('/students/me')
            .set('Authorization', 'Bearer ' + 123456789);

        expect(res.status).to.be.equal(401);
    });

    it('should return 403 if the token is valid and if the user does not have a role', async () => {
        // Assign no role to the user
        mocksdk.auth().setCustomUserClaims('123', { role: null });

        const res = await request(server)
            .get('/students/me')
            .set('Authorization', 'Bearer ' + token);

        expect(res.status).to.be.equal(403);
    });

    it('should return 403 if the token is valid and if the user is not a student/admin', async () => {
        // Assign the instructor role to the user
        mocksdk.auth().setCustomUserClaims('123', { role: 1 });

        const res = await request(server)
            .get('/students/me')
            .set('Authorization', 'Bearer ' + token);

        expect(res.status).to.be.equal(403);
    });

    it('should return 200 if the token is valid and if the user is a student', async () => {
        // Assign the student role to the user
        mocksdk.auth().setCustomUserClaims('123', { role: 0 });

        const res = await request(server)
            .get('/students/me')
            .set('Authorization', 'Bearer ' + token);

        expect(res.status).to.be.equal(200);
    }); 

    it('should return 200 if the token is valid and if the user is an admin', async () => {
        // Assign the admin role to the user
        mocksdk.auth().setCustomUserClaims('123', { role: 2 });

        const res = await request(server)
            .get('/students/me')
            .set('Authorization', 'Bearer ' + token);

        expect(res.status).to.be.equal(200);
    }); 
});