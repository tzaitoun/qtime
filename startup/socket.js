const { Classroom } = require('../models/classroom');

const authSocket = require('../middleware/authSocket');

module.exports = function(nsp) {
    nsp.use(authSocket);

    nsp.on('connect', async (socket) => {
        const name = socket.nsp.name;
        const classId = name.split('/')[2];

        const classroom = await Classroom.findById(classId);

        if (socket.rooms['students']) {

            if (classroom.active) {
                socket.emit('question', classroom.question);
            }
        }
    });
}