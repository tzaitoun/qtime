const admin = require('firebase-admin');

/* This middleware function is used to verify that a user is a student when accessing instructor-only resources */
module.exports = function(req, res, next) {
    
    // The header has to be formatted as Bearer token in the Authorization header: Bearer idToken 
    const authHeader = req.header('Authorization');
    if (!authHeader.startsWith('Bearer ')) return res.status(400).json({ status_message: 'Bad Request: Invalid header' });

    const idToken = authHeader.split(' ')[1];
    if (!idToken) return res.status(400).json({ status_message: 'Bad Request: Invalid header' });
    
    // Verify the token, check that the user is a student, and store the firebase user id in the request 
    admin.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
            
            if (!(decodedToken.role === 0)) {
                return res.status(403).json({ status_message: 'Forbidden: You do not have permission to access this resource' });
            }
            
            const uId = decodedToken.uid;
            req.uId = uId;
            next();
        })
        .catch(function(error) {
            return res.status(400).json({ status_message: 'Bad Request: Invalid token' });
        });
}