const admin = require('firebase-admin');

module.exports = function(req, res, next) {
    
    const authHeader = req.header('Authorization');
    if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Access Denied: No token provided' });

    const idToken = authHeader.split(' ')[1];
    if (!idToken) return res.status(401).json({ message: 'Access Denied: No token provided' });
    
    admin.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
            if (!(decodedToken.role === 0)) return res.status(401).json({ message: 'Access Denied' });
            
            const uId = decodedToken.uid;
            req.uId = uId;
            next();
        })
        .catch(function(error) {
            res.status(400).json({ message: 'Invalid token' })
        });
}