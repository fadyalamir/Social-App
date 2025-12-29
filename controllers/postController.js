const fs = require ('node:fs');
const path = require ('node:path');
const asyncHandler = require('express-async-handler');
const { Post , validateCreatePost , validateUpdatePost } = require("../models/post.js");
const { cloudinaryUploadImage, cloudinaryRemoveImage } = require("../utils/cloudnary.js");
const { Comment } = require('../models/comment.js');

//create new post
module.exports.createPostCtrl = asyncHandler(async (req , res)=>{
  //validation for image
  if(!req.file){
    return res.status(400).json({message:"no image provided"})
  }
  //validation for data
  const {error} = validateCreatePost(req.body);
  if(error){
    return res.status(400).json({message : error.details[0].message});
  }
  //upload photo
  const imagePath = path.join(__dirname , `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);
  //create new post and save it on DB
  const post = await Post.create({
    title:req.body.title,
    description:req.body.description,
    category:req.body.category,
    user:req.user.id,
    image:{
      url:result.secure_url,
      publicId:result.public_id
    }
  })
  //remove image from the local server
  fs.unlinkSync(imagePath)
  //send res to the client
  return res.status(201).json(post);
})


//get All posts
module.exports.getAllPostsCtrl = asyncHandler(async (req , res)=>{
  const POST_PER_PAGE = 3;
  const {pageNumber , category} = req.query;
  let posts;
  if(pageNumber){
    posts = await Post.find().skip((pageNumber - 1) * POST_PER_PAGE).limit(POST_PER_PAGE).sort({createdAt : -1}).populate("user" , ["-password"]);
  }else if(category){
    posts = await Post.find({category : category}).sort({createdAt : -1}).populate("user" , ["-password"]);
  }else{
    posts = await Post.find().sort({createdAt : -1}).populate("user" , ["-password"]); //البوست الاحدث هيظهر الاول
  }
  return res.status(200).json(posts);
})


//get Single post
module.exports.getSinglePostCtrl = asyncHandler(async (req , res)=>{
  //old post
  // const post = await Post.findById(req.params.id).populate("user" , ["-password"]);

  //create comments
  const post = await Post.findById(req.params.id).populate("user" , ["-password"]).populate("comments");
  if(!post){
    return res.status(404).json({message : "post not found"});
  }
  return res.status(200).json(post);
})


//get posts count
module.exports.getPostCountCtrl = asyncHandler(async (req , res)=>{
  const count = await Post.countDocuments();
  return res.status(200).json(count);
})

//delete post
module.exports.deletePostCtrl = asyncHandler(async (req , res)=>{
  const post = await Post.findById(req.params.id);
  if(!post){
    return res.status(404).json({message : "post not found"});
  }
  //Middleware to delete a post (only allowed for the admin or the post owner)
  //post مش بتاع ال user اللى هناك بتاع ال middleware عشان ال 
  if(req.user.isAdmin || req.user.id === post.user.toString()){
    await Post.findByIdAndDelete(req.params.id);
    await cloudinaryRemoveImage(post.image.publicId)
    // @TODO delete all comments that belong to this post
    await Comment.deleteMany({postId:post._id})
    return res.status(200).json({message:"post has been deleted successfully" , postId:post._id});
  }else{
    res.status(200).json({message:"access denied , forbidden"});
  }
})

// update post
module.exports.updatePostCtrl = asyncHandler(async (req , res)=>{
  //validation
  const {error} = validateUpdatePost(req.body);
    if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  //get the post from DB and check if post exist
  const post = await Post.findById(req.params.id);
  if(!post){
    return res.status(404).json({ message: "post not found" });
  }
  //check if this post belong to logged in user
  if(req.user.id !== post.user.toString()){
    return res.status(403).json({message:"access denied , you are not allowed"})
  }
  //update new data
  const updatePost = await Post.findByIdAndUpdate(req.params.id , {
  $set:{
    title:req.body.title,
    description:req.body.description,
    category:req.body.category
  }
  },{new:true}).populate("user" , ["-password"]);
  //response to client
  res.status(200).json(updatePost);
})

//upload post image
module.exports.uploadPostImageCtrl = asyncHandler(async (req, res) => {
  //validation
  if(!req.file){
    return res.status(400).json({message:"no image provided"});
  }

    //get the post from DB and check if post exist
  const post = await Post.findById(req.params.id);
  if(!post){
    return res.status(404).json({ message: "post not found" });
  }

  //check if this post belong to logged in user
  if(req.user.id !== post.user.toString()){
    return res.status(403).json({message:"access denied , you are not allowed"})
  }

  //delete the old profile photo if exist
    await cloudinaryRemoveImage(post.image?.publicId);

  //get the path to the images
  const imagePath = path.join(__dirname , `../images/${req.file.filename}`)

  //upload to cloudnary
  const result = await cloudinaryUploadImage(imagePath);

    //update the image field in the DB
  const updatePost = await Post.findByIdAndUpdate(req.params.id , {
  $set:{
    image:{
    url:result.secure_url,
    publicId: result.public_id
    }
  }
  },{new:true});
  
  //send res to client
  res.status(200).json({
  message:"your image post upload successfully",
  image: { url: result.secure_url, publicId: result.public_id }
});

  //remove image from the local server
  fs.unlinkSync(imagePath)
})


//toggle like
module.exports.toggleLikeCtrl = asyncHandler(async (req, res) => {
  const loggedInUser = req.user.id;
  const { id : postId } = req.params;
  let post = await Post.findById(postId);
  if(!post){
    return res.status(404).json({message:"post not found"});
  }
  const isPostAlreadyLiked = post.likes.find((user)=> user.toString() === loggedInUser)
  if(isPostAlreadyLiked){
    post = await Post.findByIdAndUpdate(postId , {
      $pull:{
        likes:loggedInUser
      }
    },{new : true})
  }else{
    post = await Post.findByIdAndUpdate(postId , {
      $push:{
        likes:loggedInUser
      }
    },{new : true})
  }
  res.status(200).json(post)
})