const knex = require("../knex");
const moment = require("moment");
var jwt = require('jsonwebtoken');
// CREATE TABLE auth_token (
//     id SERIAL PRIMARY KEY,
//     user_id INT NOT NULL,
//     auth_token TEXT NOT NULL,
//     refresh_token TEXT NOT NULL,
//     expiry TIMESTAMP NOT NULL
// );

const TABLE_NAME = "auth_token";
const SECRET = 'hskdhf348ahdfkh4hgkjh';

const AuthToken = {
  getOrCreate: (user_id) => {
      // console.log('getOrCreate')
      // console.log(user_id)
    return knex
      .transaction((trx) => {
        trx(TABLE_NAME)
          .where({ 'user_id': user_id})
          .then((res) => {
            if (res.length === 0) {
              return trx(TABLE_NAME)
                .insert({
                  user_id,
                  auth_token: jwt.sign({ foo: 'bar' }, SECRET, {expiresIn: "1d"}),
                  refresh_token: jwt.sign({ foo: 'bar' }, SECRET, {expiresIn: "2d"}),
                  expiry: new Date().toDateString(),
                })
                .then(() => {
                  return trx(TABLE_NAME).where({ 'user_id': user_id});
                }).then(trx.commit);
            } else {
              return res;
            }
          }).then(trx.commit);
      })
      .then((result) => result[0]);
  },
  verifyToken: (token) =>{
    try {
      jwt.verify(token, SECRET);
      // console.log(decoded)
      return true;
    } catch (err) {
      // err
      // console.log(err);
      return false;
    }
  },
  delete: (parms) => {
    return knex(TABLE_NAME).del().where(parms);
  },
  find: (param) => {
    return knex(TABLE_NAME)
      .where(params)
      .select()
      .then((result) => result[0]);
  },
  findUser: (param) => {
    return knex.transaction((trx) => {
      trx(TABLE_NAME)
        .where(param)
        .then((res) => {
          // console.log('res .....token')
          // console.log(res)
          if (res.length === 1) {
            return trx("users")
              .where({ id: res[0].user_id })
              .then((result) => result[0]).then(trx.commit);
          } else {
            return false;
          }
        }).then(trx.commit);
    });
  },
  logout: (userId) =>{
    return knex(TABLE_NAME).del().where({user_id: userId });
  }
};

module.exports = AuthToken;
