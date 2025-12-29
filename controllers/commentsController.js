const asyncHandler = require('express-async-handler');
const { Comment , validateCreateComment , validateUpdateComment } = require("../models/comment.js");
const { User } = require('../models/User.js');


//create new comment
module.exports.createCommentCtrl = asyncHandler(async (req , res)=>{
  const {error} = validateCreateComment(req.body);
  if(error){
    return res.status(400).json({message : error.details[0].message});
  }
  const profile = await User.findById(req.user.id);
  const comment = await Comment.create({
    postId:req.body.postId,
    text:req.body.text,
    user:req.user.id,
    username:profile.username,
  })
  res.status(201).json(comment);
})


//get All comments
module.exports.getAllCommentsCtrl = asyncHandler(async (req , res)=>{
  const comments = await Comment.find().populate("user");
  res.status(200).json(comments);
})


//delete comment
module.exports.deleteCommentCtrl = asyncHandler(async (req , res)=>{
  const comment = await Comment.findById(req.params.id);
  if(!comment){
    return res.status(404).json({message : "comment not found"});
  }
  //Middleware to delete a comment (only allowed for the admin or the comment owner)
  //comment مش بتاع ال user اللى هناك بتاع ال middleware عشان ال 
  if(req.user.isAdmin || req.user.id === comment.user.toString()){
    await Comment.findByIdAndDelete(req.params.id);
    return res.status(200).json({message:"comment has been deleted successfully"});
  }else{
    res.status(403).json({message:"access denied , forbidden"});
  }
})

//update comment
module.exports.updateCommentCtrl = asyncHandler(async (req , res)=>{
  //validation
  const {error} = validateUpdateComment(req.body);
    if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  //get the comment from DB and check if comment exist
  const comment = await Comment.findById(req.params.id);
  if(!comment){
    return res.status(404).json({ message: "comment not found" });
  }
  //check if this comment belong to logged in user
  if(req.user.id !== comment.user.toString()){
    return res.status(403).json({message:"access denied , you are not allowed"})
  }
  //update new data
  const updateComment = await Comment.findByIdAndUpdate(req.params.id , {
  $set:{
    text:req.body.text,
  }
  },{new:true});
  //response to client
  res.status(200).json(updateComment);
})
