const { Instructor } = require('../models/instructor');
const { Student } = require('../models/student');

const admin = require('firebase-admin');

/* This middleware function is used to verify if the user attempting to connect to the /course/:courseId/classroom socket is a valid
 * user. It is also used to assign the user a socket.io room so events can be sent to a specific group of users.
 */
module.exports = function(socket, next) {
    
    // Get the token from the query parameter
    const token = socket.handshake.query.token;
    if (!token) return next(new Error('Authentication Error'));

    admin.auth().verifyIdToken(token)
        .then(async function(decodedToken) {
            
            const nsp = socket.nsp.name;
            const uId = decodedToken.uid;
            const cId = nsp.split('/')[2];

            // Check if the student/instructor are enrolled in the course and assign them to the appropriate room
            if (decodedToken.role === 0) {
                const student = await Student.findById(uId);
                const isEnrolled = student.courses.some(function(courseId) {
                    return courseId.equals(cId);
                });

                if (!isEnrolled) return next(new Error('Permission Denied Error'));
                socket.join('students');
                next();
            } 
            
            else if (decodedToken.role === 1) {
                const instructor = await Instructor.findById(uId);
                const isEnrolled = instructor.courses.some(function(courseId) {
                    return courseId.equals(cId);
                });

                if (!isEnrolled) return next(new Error('Permission Denied Error'));
                socket.join('instructors');
                next();
            }
        })
        .catch(function(error) {
            return next(new Error('Authentication Error'));
        });
}