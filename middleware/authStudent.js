const admin = require('firebase-admin');

/* This middleware function is used to verify that a user is a student when accessing student-only resources.
 * Admins also have full access.
 */
module.exports = function(req, res, next) {
    
    // The header has to be formatted as Bearer token in the Authorization header: Bearer idToken 
    const authHeader = req.header('Authorization');
    if (!authHeader.startsWith('Bearer ')) return res.status(400).json({ status_message: 'Bad Request: Invalid header' });

    const idToken = authHeader.split(' ')[1];
    if (!idToken) return res.status(400).json({ status_message: 'Bad Request: Invalid header' });
    
    // Verify the token, check that the user is a student, and store the firebase user id in the request 
    admin.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
            
            if (!(decodedToken.role === 0 || decodedToken.role === 2)) {
                return res.status(403).json({ status_message: 'Forbidden: You do not have permission to access this resource' });
            }
            
            req.uId = decodedToken.uid;
            req.role = decodedToken.role;
            next();
        })
        .catch(function(error) {
            return res.set('WWW-Authenticate', 'Bearer realm="/"').status(401).json({ status_message: 'Unauthorized: Invalid token' });
        });
}