const express = require("express");
const cors = require("cors");

const { v4: uuid } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

const errorMessage = (message) => {
  return { error: message };
};

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json(errorMessage("Usuario não encontrado!"));
  }

  request.user = user;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return response
      .status(400)
      .json(errorMessage("O username já esta cadastrado!"));
  }

  const user = {
    id: uuid(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).send();
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline + " 00:00"),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).send();
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  user.todos = user.todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, title, deadline };
    }
  });

  return response.status(200).send();
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  user.todos = user.todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, done: true };
    }
  });

  return response.status(200).send();
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json(errorMessage("todo não encontrado!"));
  }
  user.todos.splice(todo, 1);

  return response.status(200).send();
});

module.exports = app;
