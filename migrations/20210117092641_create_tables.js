exports.up = function (knex) {
  return knex.schema
    .createTable("users", function (table) {
      table.increments().primary();
      table.string("first_name", 255).notNullable();
      table.string("last_name", 255).notNullable();
      table.text("password").notNullable();
      table.text("auth_token");
      table.text("email").unique().notNullable();
    })
};

exports.down = function (knex) {
  return knex.schema
    .dropTable("user")
    .dropTable("auth_token");
};
