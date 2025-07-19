const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/username', verifyToken, userController.getUsername);
router.post('/pre-choose-username', userController.preChooseUsername);
router.post('/choose-username', verifyToken, userController.chooseUsername);
router.get('/profile/:username', userController.getUserProfileByUsername);
router.get('/account-details', verifyToken, userController.getAccountDetails);
router.put('/update-profile', verifyToken, userController.updateProfile);
router.put(
    '/update-social-links',
    verifyToken,
    userController.updateSocialLinks
);
router.get('/social-links', verifyToken, userController.getSocialLinks);
router.post('/custom-links', verifyToken, userController.addCustomLink);
router.get('/custom-links', verifyToken, userController.getCustomLinks);
router.put('/custom-links', verifyToken, userController.updateCustomLink);
router.delete(
    '/custom-links/:id',
    verifyToken,
    userController.deleteCustomLink
);

module.exports = router;
