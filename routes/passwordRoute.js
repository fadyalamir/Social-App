const {Router} =require('express');
const { resetPasswordCtrl , getResetPasswordLinkCtrl , sendResetPasswordLinkCtrl } =require('../controllers/passwordController.js');
const router = Router();


//api/password/reset-password-link
router.post('/reset-password-link' , sendResetPasswordLinkCtrl );

//api/password/reset-password/:userId/:token
router.route("/reset-password/:userId/:token").get(getResetPasswordLinkCtrl)

//api/password/reset-password/:userId/:token
router.route("/reset-password/:userId/:token").post(resetPasswordCtrl)

module.exports = router;