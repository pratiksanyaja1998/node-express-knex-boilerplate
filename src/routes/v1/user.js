var express = require("express");
var router = express.Router();
const Joi = require("joi");
const validator = require("express-joi-validation").createValidator({
  passError: true,
});
const { User, AuthToken, Orgs, Role } = require("../../models");
const { encrypt, decrypt } = require("../../helper/crypto");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.status(200).send("auth demo");
});

router.get("/profile", function (req, res) {
  res.json({
    success: true,
    user: req.user, // get the user out of session and pass to template
  });
});

router.post(
  "/list",
  validator.body(
    Joi.object({
      current: Joi.number().required(),
      pageSize: Joi.number().required(),
      total: Joi.number().required(),
      search: Joi.string().allow(null).allow('').optional(),
      sorter: Joi.object().default(null).optional(),
      // filter: Joi.object().required(),
    })
  ),
  async function (req, res) {
    const { current, pageSize, filter, total, search=null, sorter=null } = req.body;

    // check is super admin or not
    if (!req.user.role ||  !["ROLE_SYSTEM_ADMIN","ROLE_ORG_ADMIN","ROLE_MANAGER"].includes(req.user.role.name)) {
      res.status(401).json({
        success: false,
        message: "Unauthorized request",
      });
      return;
    }

    try {
      let whereParams = {"users.is_deleted": false};
      if(req.user.role.name !== "ROLE_SYSTEM_ADMIN"){
        whereParams = {
          ...whereParams,
          "users.org_id": req.user.org_id,
        }
        // console.log(whereParams)
      }

      let response = await User.list(whereParams, search, pageSize, current, sorter);
      // let users = await User.list({"users.is_deleted": false});
      // console.log(response.pagination)
      res.status(200).json({
        success: true,
        data: response.data,
        total: response.pagination.total ? response.pagination.total : total,
        current,
        pageSize,
        sorter,
        filter,
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

// create
router.post(
  "/create",
  validator.body(
    Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      org_id: Joi.number().required(),
      role: Joi.string()
        .valid(...["ROLE_ORG_ADMIN", "ROLE_MANAGER", "ROLE_USER", "ROLE_MASTER", "ROLE_CHEIF_ENGINEER", "ROLE_CHIEF_OFFICER"])
        .required(),
    })
  ),
  async function (req, res) {
    let {
      email,
      password,
      firstName: first_name,
      lastName: last_name,
      role,
      org_id,
    } = req.body;

    try {
      let user = await User.find({ email });
      if (user) {
        res.status(400).json({
          success: false,
          message: "email already exists",
        });
        return;
      }
      role = await Role.find({ name: role });

      // check role is able to create user with role
      if (role.id < req.user.role.id) {
        res.status(401).json({
          success: false,
          message:
            "Unauthorized request. You can't able to create user using this role.",
        });
      }

      //  if role is system admin then find org based on body othewise get from auth user
      if (["ROLE_SYSTEM_ADMIN"].includes(req.user.role.name)) {
        req.user["orgs"] = await Orgs.find({ id: org_id });
      }

      user = await User.create({
        email,
        password: encrypt(password),
        first_name,
        last_name,
        org_id: req.user.orgs.id,
        role_id: role.id,
      });
      user["orgs"] = req.user.orgs;
      user["role"] = role;
      // delete user["org_id"];
      delete user["password"];
      delete user["role_id"];
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

// update
router.post(
  "/update",
  validator.body(
    Joi.object({
      id: Joi.number().required(),
      email: Joi.string().email().required(),
      // password: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      org_id: Joi.number().required(),
      role: Joi.string()
        .valid(...["ROLE_ORG_ADMIN", "ROLE_MANAGER", "ROLE_USER", "ROLE_MASTER", "ROLE_CHEIF_ENGINEER", "ROLE_CHIEF_OFFICER"])
        .required(),
    })
  ),
  async function (req, res) {
    let { id, email, firstName, lastName, org_id, role } = req.body;

    if(req.user.role.name!=="ROLE_SYSTEM_ADMIN"){
      org_id = req.user.orgs.id
    }

    try {

      role = await Role.find({name: role});
      let user = await User.update(id, {
        org_id,
        first_name: firstName,
        last_name: lastName,
        email,
        role_id: role.id
      });
      // console.log(user);
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

// delete
router.delete(
  "/delete",
  validator.body(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  async function (req, res) {
    const { id } = req.body;
    try {
      let user = await User.find({ id });

      // check auth user is able to delete or not
      if (user.role_id < req.user.role_id) {
        res.status(401).json({
          success: false,
          message: "Unauthorized request",
        });
        return;
      }

      user = await User.delete(id);
      // console.log(orgs)
      res.status(200).json({
        success: true,
        data: { deleted_records: user },
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

// multi delete
router.post(
  "/multi/delete",
  validator.body(
    Joi.object({
      idList: Joi.array().items(Joi.number()).default([]),
    })
  ),
  async function (req, res) {
    const { idList } = req.body;
    try {
      // let user = await User.find({ id });

      // check auth user is able to delete or not
      // if(user.role_id < req.user.role_id){
      //   res.status(401).json({
      //     success: false,
      //     message: "Unauthorized request",
      //   });
      //   return;
      // }

      user = await User.updateMultiple(idList, { is_deleted: true });
      console.log(user);
      res.status(200).json({
        success: true,
        data: { deleted_records: user },
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

// logout
router.get("/logout", async function (req, res) {
  
  try{

    let token = await AuthToken.logout(req.user.id)

    res.status(200).json({
      success: true,
      data: token,
    });

  }catch(error){
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
  }

});

module.exports = router;
