const admin = require('firebase-admin');
const serviceAccount = require('../qtime-firebase.json');

module.exports = function() {
    const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
