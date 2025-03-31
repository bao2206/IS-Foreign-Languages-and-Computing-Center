const express = require('express');
const router = express.Router();
const { createUser} = require('../controllers/UserController');

router.get('/', 
    (req, res) => {
        res.send('User route is working!');
    }
);

router.post('/createUser', createUser);

module.exports = router;