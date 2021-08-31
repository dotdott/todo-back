"use strict";

const User = use("App/Models/User");
const { validate } = use("Validator");

class UserController {
  async index() {
    const users = await User.query().setHidden(["password"]).fetch();

    return users;
  }

  async login({ auth, request, response }) {
    const { email, password } = request.all();

    try {
      const { token } = await auth.attempt(email, password);

      const user = await User.query()
        .where("email", email)
        .setHidden(["password"])
        .fetch();

      return response.status(200).send({ user, token });
    } catch (err) {
      return response.status(400).send({ error: "Email/senha não conferem" });
    }
  }

  async store({ request, response, auth }) {
    const { username, email, password } = request.all();

    const rules = {
      email: "required|email|unique:users,email",
      username: "required",
      password: "required|min:8",
    };

    const messages = {
      "username.required": "O nome de usuário é obrigatório",
      "email.required": "O email é obrigatório",
      "email.email": "O email precisa ser válido",
      "email.unique": "O email já está registrado",
      "password.required": "A senha é obrigatória",
      "password.min": "A senha precisa ter no mínimo 8 caractéres",
    };

    const validation = await validate(request.all(), rules, messages);

    if (validation.fails()) {
      const message = await validation.messages();

      return response.status(400).send({ error: message[0].message });
    }

    try {
      if (username !== "") {
        const alreadyRegistered = await User.findBy("email", email);

        if (alreadyRegistered) {
          return response.status(400).send({ error: "Email já cadastrado" });
        }
        const data = request.only(["username", "email", "password"]);
        const user = await User.create(data);
        const { token } = await auth.attempt(email, password);

        const formatedUserData = {
          username: user.username,
          email: user.email,
          id: user.id,
        };

        return response.status(200).send({ user: formatedUserData, token });
      }
    } catch (err) {
      response.status(400).send({ error: "Registros invalidos" });
    }

    return response.status(200).send({ username });
  }
}

module.exports = UserController;
