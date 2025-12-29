const {Router} =require('express');
const { createPostCtrl, getAllPostsCtrl, getSinglePostCtrl, getPostCountCtrl, deletePostCtrl, updatePostCtrl, uploadPostImageCtrl, toggleLikeCtrl } =require('../controllers/postController.js');
const photoUpload = require('../middlewares/photoUpload.js');
const { validateObjectId } = require('../middlewares/validateObjectId.js');
const router = Router();


// api/posts ==> create post
router.post('/' , photoUpload.single("image") , createPostCtrl );

// api/posts ==> get All Posts
router.get('/' , getAllPostsCtrl );

// api/posts/count ==> get All count number
router.get('/count' , getPostCountCtrl );

// api/posts/:id  ==> get Single Post
router.get('/:id' , validateObjectId , getSinglePostCtrl );

// api/posts/:id ==> delete Post
router.delete('/:id' , validateObjectId , deletePostCtrl );

// api/posts/:id ==> update Post
router.put('/:id' , validateObjectId , updatePostCtrl );

// api/posts/:id ==> update Post image
router.put('/update-image/:id' , validateObjectId , photoUpload.single("image") , uploadPostImageCtrl );

// api/posts/like/:id ==> logged like
router.put('/like/:id' , validateObjectId , toggleLikeCtrl );

module.exports = router;