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

            // If the classroom is active, emit the question to the student
            if (classroom.active) {
                socket.emit('question', classroom.question);
            }
        }
    });
}