const express = require('express');
const router = express.Router();
const { createUser, getUsertoCreateAccount, registerAccount} = require('../controllers/UserController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', 
    (req, res) => {
        res.send('User route is working!');
    }
);

router.post('/createUser', createUser);

router.get('/register', authMiddleware, (req, res) => {
    getUsertoCreateAccount(req, res);
});
router.post('/register/:id', registerAccount);

module.exports = router;