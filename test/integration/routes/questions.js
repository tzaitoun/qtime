const { Instructor } = require('../../../models/instructor');
const { Course } = require('../../../models/course');
const { Question } = require('../../../models/question');

const mongoose = require('mongoose');
const shortId = require('shortid');
const request = require('supertest');
const mocksdk = require('../../firebaseMockSetup');
const { expect } = require('chai');

describe('questions endpoint', () => {

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

        course = new Course({
            name: 'Intro to Algebra',
            code: 'ALG100',
            joinCode: shortId.generate(),
            courseOwner: {
                _id: instructor._id,
                firstName: instructor.firstName,
                lastName: instructor.lastName
            }
        });

        await course.save();

        instructor.courses.push(course._id);
        await instructor.save();
    });

    after(async () => {
        await Instructor.deleteMany({});
        await Course.deleteMany({});
        await Question.deleteMany({});
    });

    describe('POST / endpoint', () => {

        it('should return 400 if the question type specified does not exist', async () => {
            const res = await request(server)
                .post('/courses/' + course._id + '/q')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    title: 'Lesson 1',
                    type: 'Matching',
                    question: '______ is the best medicine.',
                    mark: 2,
                    participationMark: 0,
                    questionDetails: {
                        answers: ['chocolate']
                    }
                });

            expect(res.status).to.be.equal(400);
        });

        it('(Fill in the Blanks) should return 400 if the question details are not formated properly', async () => {
            const res = await request(server)
                .post('/courses/' + course._id + '/q')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    title: 'Lesson 1',
                    type: 'Fill in the Blanks',
                    question: '______ is the best medicine.',
                    mark: 2,
                    participationMark: 0,
                    questionDetails: {
                        answers: []
                    }
                });

            expect(res.status).to.be.equal(400);
        });

        it('(Fill in the Blanks) should return 200 if the question is formatted properly', async () => {
            const res = await request(server)
                .post('/courses/' + course._id + '/q')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    title: 'Lesson 1',
                    type: 'Fill in the Blanks',
                    question: '______ is the best medicine.',
                    mark: 2,
                    participationMark: 0,
                    questionDetails: {
                        answers: ['chocolate']
                    }
                });

            expect(res.status).to.be.equal(200);
            expect(res.body.question.type).to.be.equal('Fill in the Blanks');
        });

        it('(Multiple Choice) should return 400 if the question details are not formated properly', async () => {
            const res = await request(server)
                .post('/courses/' + course._id + '/q')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    title: 'Lesson 1',
                    type: 'Multiple Choice',
                    question: 'What is 5+5?',
                    mark: 2,
                    participationMark: 0,
                    questionDetails: {
                        choices: ['10', '5', '0', '1'],
                        answer: 4
                    }
                });

            expect(res.status).to.be.equal(400);
        });

        it('(Multiple Choice) should return 200 if the question is formatted properly', async () => {
            const res = await request(server)
                .post('/courses/' + course._id + '/q')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    title: 'Lesson 1',
                    type: 'Multiple Choice',
                    question: 'What is 5+5?',
                    mark: 2,
                    participationMark: 0,
                    questionDetails: {
                        choices: ['10', '5', '0', '1'],
                        answer: 0
                    }
                });

            expect(res.status).to.be.equal(200);
            expect(res.body.question.type).to.be.equal('Multiple Choice');
        });

        it('(Numeric Answer) should return 400 if the question details are not formated properly', async () => {
            const res = await request(server)
                .post('/courses/' + course._id + '/q')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    title: 'Lesson 1',
                    type: 'Numeric Answer',
                    question: 'What is 5+5?',
                    mark: 2,
                    participationMark: 0,
                    questionDetails: {
                        answer: 'string'
                    }
                });

            expect(res.status).to.be.equal(400);
        });

        it('(Numeric Answer) should return 200 if the question is formatted properly', async () => {
            const res = await request(server)
                .post('/courses/' + course._id + '/q')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    title: 'Lesson 1',
                    type: 'Numeric Answer',
                    question: 'What is 5+5?',
                    mark: 2,
                    participationMark: 0,
                    questionDetails: {
                        answer: 10
                    }
                });

            expect(res.status).to.be.equal(200);
            expect(res.body.question.type).to.be.equal('Numeric Answer');
        });
    });

    describe('PUT /:questionId endpoint', () => {

        let question;

        before(async () => {
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
        });

        it('should return 404 if the question id is not valid', async () => {
            const res = await request(server)
                .put('/courses/' + course._id + '/q/' + 1)
                .set('Authorization', 'Bearer ' + token)
                .send({
                    title: 'Lesson 1',
                    type: 'Fill in the Blanks',
                    question: '______ is the best medicine.',
                    mark: 2,
                    participationMark: 0,
                    questionDetails: {
                        answers: ['chocolate']
                    }
                });

            expect(res.status).to.be.equal(404);
        });

        it('should return 400 if the question type does not exist', async () => {
            const res = await request(server)
                .put('/courses/' + course._id + '/q/' + question._id)
                .set('Authorization', 'Bearer ' + token)
                .send({
                    title: 'Lesson 1',
                    type: 'Matching',
                    question: '______ is the best medicine.',
                    mark: 2,
                    participationMark: 0,
                    questionDetails: {
                        answers: ['chocolate']
                    }
                });

            expect(res.status).to.be.equal(400);
        });

        it('should return 400 if the question details is not formatted properly', async () => {
            const res = await request(server)
                .put('/courses/' + course._id + '/q/' + question._id)
                .set('Authorization', 'Bearer ' + token)
                .send({
                    title: 'Lesson 1',
                    type: 'Fill in the Blanks',
                    question: '______ is the best medicine.',
                    mark: 2,
                    participationMark: 0,
                    questionDetails: {
                        answers: []
                    }
                });

            expect(res.status).to.be.equal(400);
        });

        it('should return 404 if the question does not exist', async () => {
            const res = await request(server)
                .put('/courses/' + course._id + '/q/' + mongoose.Types.ObjectId().toHexString())
                .set('Authorization', 'Bearer ' + token)
                .send({
                    title: 'Lesson 1',
                    type: 'Fill in the Blanks',
                    question: '______ is the best medicine.',
                    mark: 2,
                    participationMark: 0,
                    questionDetails: {
                        answers: ['chocolate']
                    }
                });

            expect(res.status).to.be.equal(404);
        });

        it('should return 200 if the question is formatted properly', async () => {
            const res = await request(server)
                .put('/courses/' + course._id + '/q/' + question._id)
                .set('Authorization', 'Bearer ' + token)
                .send({
                    title: 'Lesson 1',
                    type: 'Fill in the Blanks',
                    question: '______ is the best medicine.',
                    mark: 2,
                    participationMark: 0,
                    questionDetails: {
                        answers: ['chocolate']
                    }
                });

            expect(res.status).to.be.equal(200);
            expect(res.body.question.type).to.be.equal('Fill in the Blanks');
        });

        it('should return 400 if the question was deployed', async () => {
            question.deployed = true;
            await question.save();
            
            const res = await request(server)
                .put('/courses/' + course._id + '/q/' + question._id)
                .set('Authorization', 'Bearer ' + token)
                .send({
                    title: 'Lesson 1',
                    type: 'Fill in the Blanks',
                    question: '______ is the best medicine.',
                    mark: 2,
                    participationMark: 0,
                    questionDetails: {
                        answers: ['chocolate']
                    }
                });

            expect(res.status).to.be.equal(400);
            expect(res.body.status_message).to.be.equal('Bad Request: Cannot edit a deployed question');
        });
    });

    describe('DELETE /:questionId endpoint', () => {

        let question;

        before(async () => {
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
        });

        it('should return 404 if the question id is not valid', async () => {
            const res = await request(server)
                .delete('/courses/' + course._id + '/q/' + 1)
                .set('Authorization', 'Bearer ' + token);

            expect(res.status).to.be.equal(404);
        });

        it('should return 404 if the question does not exist', async () => {
            const res = await request(server)
                .delete('/courses/' + course._id + '/q/' + mongoose.Types.ObjectId().toHexString())
                .set('Authorization', 'Bearer ' + token);

            expect(res.status).to.be.equal(404);
        });

        it('should return 400 if the question was deployed', async () => {
            question.deployed = true;
            await question.save();

            const res = await request(server)
                .delete('/courses/' + course._id + '/q/' + question._id)
                .set('Authorization', 'Bearer ' + token);

            expect(res.status).to.be.equal(400);
        });

        it('should return 200 if the question exists and was not deployed', async () => {
            question.deployed = false;
            await question.save();

            const res = await request(server)
                .delete('/courses/' + course._id + '/q/' + question._id)
                .set('Authorization', 'Bearer ' + token);

            expect(res.status).to.be.equal(200);
        });
    });

    describe('GET /:questionId endpoint', () => {

        let question;

        before(async () => {
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
        });

        it('should return 404 if the question id is not valid', async () => {
            const res = await request(server)
                .get('/courses/' + course._id + '/q/' + 1)
                .set('Authorization', 'Bearer ' + token);

            expect(res.status).to.be.equal(404);
        });

        it('should return 404 if the question does not exist', async () => {
            const res = await request(server)
                .get('/courses/' + course._id + '/q/' + mongoose.Types.ObjectId().toHexString())
                .set('Authorization', 'Bearer ' + token);

            expect(res.status).to.be.equal(404);
        });

        it('should return 200 if the question exists', async () => {
            question.deployed = false;
            await question.save();

            const res = await request(server)
                .get('/courses/' + course._id + '/q/' + question._id)
                .set('Authorization', 'Bearer ' + token);

            expect(res.status).to.be.equal(200);
        });
    });

    describe('GET / endpoint', () => {

        it('should return 200 and the questions', async () => {
            await Question.deleteMany({});
            await Question.insertMany([
                {
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
                },
                {
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
                }
            ])

            const res = await request(server)
                .get('/courses/' + course._id + '/q')
                .set('Authorization', 'Bearer ' + token);

            expect(res.status).to.be.equal(200);
            expect(res.body.questions.length).to.be.equal(2);
        });
    });
});