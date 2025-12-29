const jwt = require("jsonwebtoken");

//verify token
function verifyToken(req, res, next) {
  const authToken = req.headers.authorization;
  if (authToken) {
    const token = authToken.split(" ")[1];
    try {
      const decodedpayload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decodedpayload;
      next();
    } catch (err) {
      return res.status(401).json({ message: "invalid Token , access denied" });
    }
  } else {
    return res
      .status(401)
      .json({ message: "no token provided , access denied" });
  }
}


//verifyToken and admin
function verifyTokenAndAdmin(req, res, next) {
  verifyToken(req, res, ()=>{
    if(req.user.isAdmin){
      next();
    }else{
      return res.status(403).json({message : "not allowed , only Admin"});
    }
  })
}


//verifyToken and only user himself
function verifyTokenAndOnlyUser(req, res, next) {
  verifyToken(req, res, ()=>{
    if(req.user.id === req.params.id){
      next();
    }else{
      return res.status(403).json({message : "not allowed , only User Himself"});
    }
  })
}


//verifyToken and Autherization(user himself & Admin)
function verifyTokenAndAutherization(req, res, next) {
  verifyToken(req, res, ()=>{
    if(req.user.id === req.params.id || req.user.isAdmin){
      next();
    }else{
      return res.status(403).json({message : "not allowed , User Himself or Admin"});
    }
  })
}


module.exports ={
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndOnlyUser,
  verifyTokenAndAutherization
}