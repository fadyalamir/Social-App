const {Router} =require('express');
const { registerUserCtrl, loginUserCtrl, verifyUserAccountCtrl } =require('../controllers/authController.js');
const router = Router();

router.post('/register' , registerUserCtrl );
router.post('/login' , loginUserCtrl );
router.get('/:userId/verify/:token' , verifyUserAccountCtrl );

module.exports = router;