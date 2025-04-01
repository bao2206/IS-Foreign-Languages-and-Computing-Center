const express = require('express');
const router = express.Router();
const { createUser, getUsertoCreateAccount, registerAccount} = require('../controllers/UserController');

router.get('/', 
    (req, res) => {
        res.send('User route is working!');
    }
);

router.post('/createUser', createUser);

router.get('/register/:token', (req, res) => {
    getUsertoCreateAccount(req, res);
});
router.post('/register/:token', registerAccount);

module.exports = router;