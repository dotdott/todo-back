"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class UserUpdateSchema extends Schema {
  up() {
    this.alter("users", (table) => {
      // alter table
      table.dropUnique("username");
    });
  }

  down() {
    this.table("users", (table) => {
      // reverse alternations
      table.dropUnique("username");
      // table.string("username", 80).notNullable().unique(false).alter();
    });
  }
}

module.exports = UserUpdateSchema;
