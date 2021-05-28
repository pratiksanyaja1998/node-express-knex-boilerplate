var express = require("express");
var router = express.Router();
const Joi = require("joi");
const validator = require("express-joi-validation").createValidator({passError: true});
const knex = require('../../knex');

/* GET users listing. */
// http://localhost:8000/boilerplate
router.get("/", function (req, res, next) {
  res.status(200).send("boilerplate");
});


// https://www.npmjs.com/package/express-joi-validation#api
// http://localhost:8000/boilerplate/joi-testing?name=pratik
router.get(
  "/joi-testing",
  validator.query(
    Joi.object({
      name: Joi.string().required(),
    })
  ),
  (req, res) => {
    // If we're in here then the query was valid!
    res.end(`Hello ${req.query.name}! \nyou can check doc on  https://www.npmjs.com/package/express-joi-validation#api`);
  }
);

module.exports = router;
