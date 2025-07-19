const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/username', verifyToken, userController.getUsername);
router.post('/pre-choose-username', userController.preChooseUsername);
router.post('/choose-username', verifyToken, userController.chooseUsername);

module.exports = router;
