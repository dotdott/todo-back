"use strict";

const Todo = use("App/Models/Todo");
const { validate } = use("Validator");
const Database = use("Database");

class TodoController {
  async index({ request, response }) {
    try {
      const { user_id, has_completed } = request.only([
        "user_id",
        "has_completed",
      ]);

      const numberedID = Number(user_id);
      if (numberedID && numberedID > 0) {
        let todos;

        if (has_completed) {
          todos = await Todo.query().where({ user_id, has_completed }).fetch();
        }

        if (!has_completed) {
          todos = await Todo.query().where({ user_id }).fetch();
        }

        return todos;
      } else {
        return response
          .status(400)
          .send({ error: "ID de usuário é obrigatório!" });
      }
    } catch (err) {
      return response
        .status(400)
        .send({ error: "ID de usuário é obrigatório!" });
    }
  }

  async store({ request, response, auth }) {
    const { id } = auth.user;

    let task = request.only([
      "task",
      "description",
      "has_completed",
      "finished_at",
    ]);

    const rules = {
      task: "required",
      description: "max:300",
    };

    const messages = {
      "task.required": "O nome da tarefa é obrigatório",
      "description.max":
        "O número máximo de caractéres para a descrição é de 300",
    };

    const validation = await validate(request.all(), rules, messages);

    if (validation.fails()) {
      const message = await validation.messages();

      return response.status(400).send({ error: message[0].message });
    }

    if (!task.has_completed) {
      task.has_completed = 0;
    }
    if (!task.description) {
      task.description = "";
    }

    const todo = Todo.create({ ...task, user_id: id });

    return todo;
  }

  async update({ request, response, params }) {
    const { has_completed, finished_at, task, description } = request.all();
    const taskId = params.id;

    if (!has_completed) {
      return response.status(400).send({
        error: "O campo has_completed é obrigatório para uma alteração",
      });
    }

    if (!taskId) {
      return response.status(401).send({
        error: "O id da tarefa é obrigatório!",
      });
    }

    const toQuery = { has_completed };

    if (finished_at) {
      Object.assign(toQuery, { finished_at });
    }

    if (task) {
      Object.assign(toQuery, { task });
    }

    if (description) {
      Object.assign(toQuery, { description });
    }

    await Todo.query().where("id", taskId).update(toQuery);

    const thisTodo = await Todo.query().where("id", taskId).fetch();

    return thisTodo;
  }

  async delete({ request, response, auth }) {
    const { id } = auth.user;
    const { todo_id } = request.only(["todo_id"]);

    if (!todo_id) {
      return response
        .status(400)
        .send({ error: "O parametro todo_id é obrigatório." });
    }

    const thisTodo = await Database.table("todos").where("id", todo_id);

    if (!thisTodo) {
      return response
        .status(400)
        .send({ error: "A tarefa com este id já foi deletada ou não existe." });
    }

    if (thisTodo[0].user_id === id) {
      const deletedTask = await Database.table("todos")
        .where("id", todo_id)
        .delete();

      return response.status(200).send("Tarefa deletada.");
    } else {
      return response
        .status(403)
        .send({ error: "Somente o usuário dono da tarefa pode deleta-la." });
    }
  }
}

module.exports = TodoController;
