const config = require('config');
const admin = require(config.get('firebaseAdmin'));

/* This middleware function is only used in the creation of new users. Once they create their account using firebase authentication, 
 * they use an idToken to create either a student or instructor "account" on our database.
 */
module.exports = function(req, res, next) {
    
    // The header has to be formatted as Bearer token in the Authorization header: Bearer idToken 
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(400).json({ status_message: 'Bad Request: Invalid header' });

    const idToken = authHeader.split(' ')[1];
    if (!idToken) return res.status(400).json({ status_message: 'Bad Request: Invalid header' });
    
    // Verify the token and store the firebase user id in the request 
    admin.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
            req.uId = decodedToken.uid;
            next();
        })
        .catch(function(error) {
            return res.set('WWW-Authenticate', 'Bearer realm="/"').status(401).json({ status_message: 'Unauthorized: Invalid token' });
        });
}