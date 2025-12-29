const {Router} =require('express');
const { createCommentCtrl, getAllCommentsCtrl, updateCommentCtrl , deleteCommentCtrl } =require('../controllers/commentsController.js');
const { verifyTokenAndAdmin } = require('../middlewares/verifyToken.js');
const  {validateObjectId}  = require('../middlewares/validateObjectId.js');
const router = Router();

// /api/comments ==> create comment
router.post('/' , createCommentCtrl );

// /api/comments ==> get all comments
router.get('/' , verifyTokenAndAdmin , getAllCommentsCtrl );

// /api/comments/:id ==> delete comment
router.delete('/:id' , validateObjectId , deleteCommentCtrl );

// /api/comments/:id ==> update comment
router.put('/:id' , validateObjectId , updateCommentCtrl );

module.exports = router;