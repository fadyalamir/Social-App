const mongoose = require("mongoose");
const Joi = require("joi");

const CategorySchema = new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  title:{
    type: String,
    required: true,
    trim:true
    }
}, { timestamps: true });


// create comment validate
function validateCreateComment(obj) {
  const schema = Joi.object({
    postId: Joi.string().required(),
    text: Joi.string().trim().required(),
  });
  return schema.validate(obj);
}

// create Category validate
function validateCreateCaregory(obj) {
  const schema = Joi.object({
    title: Joi.string().trim().required().label("Title"),
  });
  return schema.validate(obj);
}

const Category = mongoose.model("Category", CategorySchema);
module.exports = {
  Category,
  validateCreateCaregory
};