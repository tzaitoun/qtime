const admin = require('firebase-admin');

/* This middleware function is only used in the creation of new users. Once they create their account using firebase authentication, 
 * they use an idToken to create either a student or instructor "account" on our database.
 */
module.exports = function(req, res, next) {
    
    // The header has to be formatted as Bearer token in the Authorization header: Bearer idToken 
    const authHeader = req.header('Authorization');
    if (!authHeader.startsWith('Bearer ')) return res.status(400).json({ status_message: 'Bad Request: Invalid header' });

    const idToken = authHeader.split(' ')[1];
    if (!idToken) return res.status(400).json({ status_message: 'Bad Request: Invalid header' });
    
    // Verify the token and store the firebase user id in the request 
    admin.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
            const uId = decodedToken.uid;
            req.uId = uId;
            next();
        })
        .catch(function(error) {
            return res.status(400).json({ status_message: 'Bad Request: Invalid token' });
        });
}