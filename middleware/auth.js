const admin = require('firebase-admin');

module.exports = function(req, res, next) {
    const idToken = req.header('Authorization');
    if (!idToken) return res.status(401).json({ message: 'Access Denied: No token provided' });
    
    admin.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
            const uid = decodedToken.uid;
            req.uid = uid;
            next();
        })
        .catch(function(error) {
            res.status(400).json({ message: 'Invalid token' })
        });
}