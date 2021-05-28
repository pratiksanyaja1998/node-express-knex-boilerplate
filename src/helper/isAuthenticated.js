const { AuthToken,  } = require("../models");

// route middleware to make sure a user is logged in
async function isAuthenticated(req, res, next) {
  // check token and set app user details on res
  // if (req.isAuthenticated())
  // console.log( "Header details ..................", req.headers.authorization)

  if (!req.headers.authorization || req.headers.authorization == undefined)
    return res
      .status(401)
      .json({ success: false, message: "No credentials sent!" });

  if (
    !req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Token"
  ) {
    return res
      .status(401)
      .json({ success: false, message: "No credentials sent!" });
  } else if (req.headers.authorization.split(" ").length < 2) {
    return res
      .status(401)
      .json({ success: false, message: "set valied credentials" });
  }

  try{

      let token = req.headers.authorization.split(" ")[1];

      // if(!AuthToken.verifyToken(token)){
      //   AuthToken.delete({auth_token: token})
      //   res.status(401).json({
      //     success: false,
      //     type: "auth", // will be "query" here, but could be "headers", "body", or "params"
      //     message: "401 Unauthorized Request. Token is expired or wrong.",
      //   });
      // }

      let user  = await AuthToken.findUser({ auth_token: token })
      // console.log("user .......")
      // console.log(user)
      if(!user){
        res.status(401).json({
          success: false,
          type: "auth", // will be "query" here, but could be "headers", "body", or "params"
          message: "401 Unauthorized Request :(",
        });
        return;
      }

      // console.log("user set ......")
      // console.log(user)
      req.user = user;
      return next();
  }catch(error) {
      res.status(500).json({
        success: false,
        type: "unauthorized", // will be "query" here, but could be "headers", "body", or "params"
        message: "Internal server error",
      });
  }
 
}

module.exports = isAuthenticated;
