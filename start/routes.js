"use strict";

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use("Route");

Route.get("/", "HomeController.index").middleware("auth");
Route.get("/users", "UserController.index");
Route.get("/login", "UserController.login");
Route.post("/register", "UserController.store");

Route.get("/todo", "TodoController.index").middleware("auth");
Route.post("/todo", "TodoController.store").middleware("auth");
Route.put("/todo/:id", "TodoController.update").middleware("auth");
Route.post("/todo/delete", "TodoController.delete").middleware("auth");
