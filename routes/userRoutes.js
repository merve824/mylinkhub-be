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
router.post('/social-links', verifyToken, userController.addLink);
router.put('/social-links', verifyToken, userController.updateLink);
router.delete('/social-links/:key', verifyToken, userController.deleteLink);
router.get('/social-links', verifyToken, userController.getSocialLinks);
router.post('/custom-links', verifyToken, userController.addCustomLink);
router.get('/custom-links', verifyToken, userController.getCustomLinks);
router.put('/custom-links', verifyToken, userController.updateCustomLink);
router.delete(
    '/custom-links/:id',
    verifyToken,
    userController.deleteCustomLink
);
router.put('/frozen', verifyToken, userController.freezeAccount);
router.delete('/account', verifyToken, userController.deleteAccount);
router.put(
    '/background-color',
    verifyToken,
    userController.changeBackgroundColor
);
router.put('/font', verifyToken, userController.changeFont);
router.post('/crerate-profile', userController.createProfile);

module.exports = router;
