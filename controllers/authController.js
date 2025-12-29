const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { User, validationRegisterUser, validationLoginUser} = require("../models/User");
const { VerificationToken } = require('../models/verificationToken.js');
const EmailTemplate = require("../utils/EmailTemplate.js");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail.js");

/**-----------------------------------------------
 * @desc    Register New User
 * @route   /api/auth/register
 * @method  POST
 * @access  public
 ------------------------------------------------*/
module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
  // validation
  const { error } = validationRegisterUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  // is user already exists
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({ message: "user already exist" });
  }
  // hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  // new user and save it to DB
  user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
  });
  await user.save();
  //==========================================================
  // TODO sending email (verify account) ==> after frontend
  // creating new VerificationToken & save it in DB
  const verifictionToken = new VerificationToken({
    userId: user._id,
    token: crypto.randomBytes(32).toString("hex"),
  });
  await verifictionToken.save();

  // Making the link
  const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verifictionToken.token}`;

  // Putting the link into an html template
  const htmlTemplate = EmailTemplate(link);

  // Sending email to the user
  await sendEmail(user.email, "Verify Your Email", htmlTemplate);

  //==========================================================
  // send a res to client ==>before sending email (verify account)
  // res.status(201).json({ message: 'you registered successfully' });
  // send a res to client ==>after sending email (verify account)
  res.status(201).json({
    message: "We sent to you an email, please verify your email address",
  });
});




/**-----------------------------------------------
 * @desc    Login User
 * @route   /api/auth/login
 * @method  POST
 * @access  public
 ------------------------------------------------*/
module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
  // validation
  const { error } = validationLoginUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  //is user exist
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ message: "invalid email or password" });
  }
  //check the password
  const isPasswordMatch = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isPasswordMatch) {
    return res.status(400).json({ message: "invalid email or password" });
  }
  //==========================================================
  // TODO sending email (verify account if not verified) ==> after frontend
  if (!user.isAccountVerified) {
    let VerificationToken = await VerificationToken.findOne({
      userId: user._id,
    });

    if (!VerificationToken) {
      VerificationToken = new VerificationToken({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      });
      await VerificationToken.save();
    }
  //making the link
    const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${VerificationToken.token}`;
  //putting the link into an html template
    const htmlTemplate = EmailTemplate(link);
  //sending email to the user
    await sendEmail(user.email, "Verify Your Email", htmlTemplate);

    return res.status(400).json({
      message: "We sent to you an email, please verify your email address",
    });
  }
  //==========================================================
  //generate token
  const token = user.generateAuthToken();
  //response to client
  res.status(200).json({
    _id: user._id,
    isAdmin: user.isAdmin,
    profilePhoto: user.profilePhoto,
    token,
    username: user.username,
  });
});




/**-----------------------------------------------
 * @desc    Verify User Account
 * @route   /api/auth/:userId/verify/:token
 * @method  GET
 * @access  public
 ------------------------------------------------*/
module.exports.verifyUserAccountCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(400).json({ message: "invalid link" });
  }

  const VerificationToken = await VerificationToken.findOne({
    userId: user._id,
    token: req.params.token,
  });

  if (!VerificationToken) {
    return res.status(400).json({ message: "invalid link" });
  }

  user.isAccountVerified = true;
  await user.save();

  await VerificationToken.remove();

  res.status(200).json({ message: "Your account verified" });
});
