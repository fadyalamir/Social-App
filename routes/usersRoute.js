const {Router} =require('express');
const { getAllUsersCtrl, getUserProfileCtrl, updateUserProfileCtrl, getUsersCountCtrl, profilePhotoUploadCtrl, deleteUserProfileCtrl } =require('../controllers/userController.js');
const { verifyTokenAndAdmin, verifyTokenAndOnlyUser, verifyTokenAndAutherization } = require('../middlewares/verifyToken.js');
const { validateObjectId } = require('../middlewares/validateObjectId.js');
const photoUpload = require('../middlewares/photoUpload.js');
const router = Router();


// api/users/profile ==>get All Users
router.get('/profile' , verifyTokenAndAdmin , getAllUsersCtrl);

// api/users/profile/:id ==>get user profile
router.get('/profile/:id' , validateObjectId , getUserProfileCtrl);

// api/users/profile/:id ==>update user profile
router.put('/profile/:id' , validateObjectId , verifyTokenAndOnlyUser , updateUserProfileCtrl);

// api/users/profile/:id ==>delete user profile
router.delete('/profile/:id' , validateObjectId , verifyTokenAndAutherization , deleteUserProfileCtrl);

// api/users/count ==>Get the total count
router.get('/count' , verifyTokenAndAdmin , getUsersCountCtrl);

// api/users/profile/profile-photo-upload ==>update profile photo
router.post('/profile/profile-photo-upload' , photoUpload.single("image") , profilePhotoUploadCtrl);

module.exports = router;