const admin = require('firebase-admin');
const serviceAccount = require('../qtime-firebase.json');

module.exports = function() {

    if (process.env.NODE_ENV === 'production') {
        const app = admin.initializeApp();
    }

    else {
        const app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
}
