"use strict";

const Todo = use("App/Models/Todo");
const { validate } = use("Validator");

class TodoController {
  async index({ auth }) {
    const { id } = auth.user;
    const todos = await Todo.query().where("user_id", id).fetch();

    return todos;
  }

  async store({ request, response, auth }) {
    const { id } = auth.user;

    let task = request.only(["task", "description", "has_completed"]);

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

      return response.status(400).send({ Erro: message[0].message });
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
    const task = request.only(["has_completed"]);
    const taskId = params.id;

    if (!task.has_completed) {
      return response.status(400).send({
        erro: "O campo has_completed é obrigatórios para uma alteração",
      });
    }

    if (!taskId) {
      return response.status(401).send({
        erro: "O id da tarefa é obrigatório!",
      });
    }

    await Todo.query()
      .where("id", taskId)
      .update({ has_completed: task.has_completed });

    const thisTodo = await Todo.query().where("id", taskId).fetch();

    return thisTodo;
  }
}

module.exports = TodoController;
