const { Classroom } = require('../models/classroom');

const authSocket = require('../middleware/authSocket');

/* This sets up the socket middleware and listeners */
module.exports = function(nsp) {
    nsp.use(authSocket);

    // Triggered when a user connects to a certain classroom
    nsp.on('connect', async (socket) => {
        const name = socket.nsp.name;
        const classId = name.split('/')[2];

        const classroom = await Classroom.findById(classId);

        // If the user is a student (the middleware assigns users to groups/rooms)
        if (socket.rooms['students']) {

            // When a student leaves, emit the number of students in the classroom
            socket.on('disconnect', () => {
                nsp.in('students').clients((error, clients) => {
                    nsp.to('instructors').emit(clients.length);
                });
            });

            // When a student joins, emit the number of students in the classroom
            console.log(nsp.in('students').adapter);
            nsp.in('students').clients((error, clients) => {
                console.log(error);
                nsp.to('instructors').emit(clients.length);
            });

            // If the classroom exists and is active, emit the question to the student
            if (classroom && classroom.active) {
                socket.emit('question', classroom.question);
            }
        }
    });
}