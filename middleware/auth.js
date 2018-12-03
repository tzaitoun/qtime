const admin = require('firebase-admin');

module.exports = function(req, res, next) {
    // The header should have the following form: Bearer idToken
    const idToken = req.header('Authorization').split(" ")[1];
    if (!idToken) return res.status(401).json({ message: 'Access Denied: No token provided' });
    
    admin.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
            const uId = decodedToken.uid;
            req.uId = uId;
            next();
        })
        .catch(function(error) {
            res.status(400).json({ message: 'Invalid token' })
        });
}