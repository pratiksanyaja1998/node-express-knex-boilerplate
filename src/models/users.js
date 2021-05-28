const knex = require("../knex");
const { encrypt, decrypt } = require("../helper/crypto");
// CREATE TABLE users (
//     id SERIAL PRIMARY KEY,
//     first_name VARCHAR(255) NOT NULL,
//     last_name VARCHAR(255) NOT NULL,
//     email TEXT NOT NULL,
//     password VARCHAR(50) NOT NULL,
//     org_id INT NOT NULL,
//    CONSTRAINT unique_email UNIQUE (email)
// );
const TABLE_NAME = "users";

function getSortFiledName(key) {
  switch (key) {
    case "url":
      return "orgs.url";
    case "phone":
      return "orgs.phone";
    case "email":
      return "users.email";
    case "org_name":
      return "orgs.name";
    case "role_name":
      return "roles.name";
    case "first_name":
      return "users.first_name";
    case "last_name":
      return "users.last_name";
  }
}

const User = {
  create: (params) => {
    // params['org_id'] = 1;
    // params['password'] = encrypt(params['password'])
    // console.log(params['password'])
    return knex(TABLE_NAME)
      .insert(params)
      .returning("*")
      .then((result) => result[0]);
  },
  find: (params) => {
    return knex(TABLE_NAME)
      .where(params)
      .select()
      .then((result) => result[0]);
  },
  findAll: (params) => {
    return knex.select(
      "users.id",
      "users.first_name",
      "users.last_name",
      "users.email",
      "roles.name as roles_name"
    ).from(TABLE_NAME)
      .where(params)
      .join("roles", "users.role_id", "roles.id")
  },
  // list user for admin
  list: (whereParams, search, perPage, currentPage, sorter) => {
    return knex
      .select(
        "orgs.name as org_name",
        "orgs.id as org_id",
        "roles.name as role_name",
        "users.id",
        "users.first_name",
        "users.last_name",
        "users.email",
        "users.is_deleted"
      )
      .from(TABLE_NAME)
      .where(whereParams)
      .andWhere((db) => {
        // console.log(search)
        if (search && search != "" && search != "null") {
          // console.log('---------------')
          // console.log(search)
          db.where("users.email", "like", `%${search}%`);
          db.orWhere("orgs.name", "like", `%${search}%`);
          db.orWhere("roles.name", "like", `%${search}%`);
          db.orWhere("users.first_name", "like", `%${search}%`);
          db.orWhere("users.last_name", "like", `%${search}%`);
        }
        // db.orWhere('orgs.name', 'like', `%${search}%`);
      })
      .join("orgs", "users.org_id", "orgs.id")
      .join("roles", "users.role_id", "roles.id")
      .modify(function (db) {
        if (sorter && sorter != undefined) {
          Object.keys(sorter).length > 0 &&
            db.orderBy(
              getSortFiledName(Object.keys(sorter)[0]),
              sorter[Object.keys(sorter)[0]].substring(
                0,
                sorter[Object.keys(sorter)[0]].length - 3
              )
            );
        }
      })
      .paginate({ perPage, currentPage });
  },
  delete: (id) => {
    return knex(TABLE_NAME).del().where({ id });
  },
  updateMultiple: (idList, params) => {
    return knex(TABLE_NAME).update(params).whereIn("id", idList);
  },
  update: (id, params) => {
    return knex(TABLE_NAME).update(params).where({ id });
  },
};

module.exports = User;
