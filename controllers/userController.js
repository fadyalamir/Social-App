const asyncHandler = require('express-async-handler');
const { User, validationUpdateUser } = require("../models/User");
const { cloudinaryUploadImage, cloudinaryRemoveImage , cloudinaryRemoveMultipleImage } = require("../utils/cloudnary.js");
const bcrypt = require('bcryptjs');
const path = require ('node:path');
const fs = require ('node:fs');
const { Comment } = require('../models/comment.js');
const { Post } = require('../models/post.js');

//get All Users
module.exports.getAllUsersCtrl = asyncHandler(async (req , res)=>{
  //old code
  // const users = await User.find().select("-password");
  //after create posts
  const users = await User.find().select("-password").populate("posts");
  res.status(200).json(users)
})


//get user profile
module.exports.getUserProfileCtrl = asyncHandler(async (req , res)=>{
  //old code
  // const user = await User.findById(req.params.id).select("-password");

  //after create posts
  const user = await User.findById(req.params.id).select("-password").populate("posts");
  if(!user){
    return res.status(404).json({message : "user not found"})
  }
  res.status(200).json(user);
})


//update user profile
module.exports.updateUserProfileCtrl = asyncHandler(async (req , res)=>{
  //validation
    const { error } = validationUpdateUser(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    //hash password if the user want to change password
    if(req.body.password){
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    //update new data
    const updateUser = await User.findByIdAndUpdate(req.params.id , {
      $set:{
        username:req.body.username,
        password:req.body.password,
        bio:req.body.bio
      }
    },{new:true}).select("-password")

    //response to client
    res.status(200).json(updateUser);
})

//get users count
//Database فى ال userعشان نعرف كام 
module.exports.getUsersCountCtrl = asyncHandler(async (req, res) => {
  const counts = await User.countDocuments();
  res.status(200).json(counts);
});


//upload profile photo
module.exports.profilePhotoUploadCtrl = asyncHandler(async (req, res) => {
  //validation
  if(!req.file){
    return res.status(400).json({message:"no file provided"});
  }

  //get the path to the images
  const imagePath = path.join(__dirname , `../images/${req.file.filename}`)

  //upload to cloudnary
  const result = await cloudinaryUploadImage(imagePath);

  //get the user from DB
  const user = await User.findById(req.user.id);

  //delete the old profile photo if exist
  if(user.profilePhoto.publicId !== null){
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }

  //change the profilePhoto field in the DB
  user.profilePhoto = {
    url:result.secure_url,
    publicId: result.public_id
  }
  await user.save();
  
  //send res to client
  res.status(200).json({
    message:"your profile photo upload successfully",
    profilePhoto:{url:result.secure_url , publicId:result.public_id}
  });

  //remove image from the local server
  fs.unlinkSync(imagePath)
})


//delete user profile
module.exports.deleteUserProfileCtrl = asyncHandler(async (req, res) => {
  //get user from DB
  const user = await User.findById(req.params.id);
  if(!user){
    return res.status(404).json({message:"user not found"});
  }
  //@TODO get all posts from DB
  const posts = await Post.find({user:user._id})
  //@TODO get the public ids from the posts
  const publicIds = posts?.map((post)=> post.image.publicId )
  //@TODO delete all posts image from cloudinary that belong to this user
  if(publicIds?.length > 0){
    await cloudinaryRemoveMultipleImage(publicIds)
  }
  //delete the frofile picture from cloudinary
  await cloudinaryRemoveImage(user.profilePhoto.publicId);
  //@TODO delete user posts & comments
  await Post.deleteMany({user:user._id});
  await Comment.deleteMany({user:user._id});
  //delete the user himself
  await User.findByIdAndDelete(req.params.id);
  //send a res to the client
  return res.status(200).json({message:"your profile has been deleted"});
})