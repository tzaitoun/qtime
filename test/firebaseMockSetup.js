const firebaseMock = require('firebase-mock');

// This sets up a firebase mock object to use the auth module and exports it
const mockAuth = new firebaseMock.MockAuthentication();
module.exports = new firebaseMock.MockFirebaseSdk(null, () => { return mockAuth }, null, null, null);