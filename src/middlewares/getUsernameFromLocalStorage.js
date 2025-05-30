const getUsernameFromLocalStorage = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        // console.log("Authheader ",authHeader)
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        
        // Decode the token
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decodedToken = JSON.parse(jsonPayload);
        // console.log("Decoded token ",decodedToken)
        // Add username to request object
        req.username = decodedToken.username;
        // console.log("Username ", req.username)
        next();
    } catch (error) {
        console.error('Error getting username from token:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

module.exports = getUsernameFromLocalStorage;