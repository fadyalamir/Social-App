const mongoose = require("mongoose");
const Joi = require("joi");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Post title is required"],
    trim: true,
    minlength: 3,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, "Post description is required"],
  trim: true,
  minlength: 10
  },
  image: {
    type: Object,
    default: {
      url:"",
      publicId:null
    }
  },
  category: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
}, { timestamps: true , toJSON:{virtual:true} , toObject:{virtual:true}}); 

//show all comments that belong to the user when he get posts
postSchema.virtual("comments" , {
  ref:"Comment",
  foreignField:"postId",
  localField:"_id"
})


//validate create post
function validateCreatePost(obj) {
  const schema = Joi.object({
    title:Joi.string().trim().min(3).max(200).required(),
    description:Joi.string().trim().min(10).required(),
    category:Joi.string().trim().required(),
  });
  return schema.validate(obj);
}


//validate update post
function validateUpdatePost(obj) {
  const schema = Joi.object({
    title:Joi.string().trim().min(3).max(200),
    description:Joi.string().trim().min(10),
    category:Joi.string().trim(),
  });
  return schema.validate(obj);
}

const Post = mongoose.model("Post", postSchema);
module.exports = {
  Post,
  validateCreatePost,
  validateUpdatePost
};