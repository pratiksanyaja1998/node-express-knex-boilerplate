var express = require("express");
var router = express.Router();
const Joi = require("joi");
const validator = require("express-joi-validation").createValidator({
  passError: true,
});
const { User, AuthToken, } = require("../../models");
const { encrypt, decrypt } = require('../../helper/crypto')

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.status(200).send("auth demo");
});

router.post(
  "/login",
  validator.body(
    Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    })
  ),
  async function (req, res, next) {
    const { email, password } = req.body;
    let user = {};
    try {
      // console.log("/login ...");
      user = await User.find({ email });
      // console.log("user .....")
      // console.log(user)
      // console.log(decrypt(user['password']))
      if(!user || decrypt(user["password"])!==password){
        console.log("not found ...")
        res.status(401).json({
          success: false,
          message: "Email or password is invalid",
        });
        res.end()
        return;
      }

      let authToken = await AuthToken.getOrCreate(user.id);
      let orgs = await Orgs.find({ id: user.org_id });
      // console.log(authToken)
      // console.log("login aaaa")
      user["token"] = authToken;
      user["role"] = await Role.find({id: user.role_id});

      delete user["password"];
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

router.post(
  "/admin/signup",
  validator.body(
    Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      // orgsName: Joi.string().required(),
      // orgsEmail: Joi.string().email().default(null),
      // phone: Joi.string().default(null),
      // url: Joi.string().default(null),
      role: Joi.string().valid(...['ROLE_SYSTEM_ADMIN','ROLE_ORG_ADMIN','ROLE_MANAGER','ROLE_USER']).required()
    })
  ),
  async function (req, res, next) {
    let {
      email,
      password,
      firstName: first_name,
      lastName: last_name,
      orgsName,
      phone,
      role,
      orgsEmail, url
    } = req.body;

    try {
      let user = await User.find({email})
      if(user){
        res.status(400).json({
          success: false,
          message: 'email already exists',
        });
        return;
      }
      // let orgs = await Orgs.create({ name: orgsName, phone, email: orgsEmail, url: url });
      role = await Role.find({name: role})
      user = await User.create({
        email,
        password: encrypt(password),
        first_name,
        last_name,
        role_id: role.id
      });
      let authToken = await AuthToken.getOrCreate(user.id);
      user["token"] = authToken;
      user['role'] = role;
      delete user["org_id"];
      delete user["password"];
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

module.exports = router;
