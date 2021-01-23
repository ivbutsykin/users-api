const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const users = [];

app.use(cors());
app.use(bodyParser.json());

app.get('/users', (request, response) => {
  response.json(users);
});

app.get('/users/:id', (request, response) => {
  const id = request.params.id;
  const user = users.find(user => user.id === id);

  if (!!user) {
    return response.json(user);
  }

  response.status(404).send();
});

app.delete('/users/:id', (req, res) => {
  const id = req.params.id;
  const user = users.find(user => user.id === id);
  const index = users.indexOf(user);

  if (!!user) {
    users.splice(index, 1);
    return res.status(200).send();
  }

  res.status(404).send();
});

app.patch('/users/:id', whitelist('email', 'name'), (req, res) => {
  const id = req.params.id;
  const user = users.find(user => user.id === id);
  const body = req.body;

  if (!!user) {
    for (const property in body) {
      user[property] = body[property];
    }
    return res.status(200).send(user);
  }

  res.status(404).send();
});

app.post('/users', validate('email', 'name'), (req, res) => {
  const body = req.body;
  const user = {
    email: body.email,
    name: body.name,
    id: Date.now().toString(),
  };

  users.push(user);
  res.json(user);
});

app.listen(8080, () => {
  console.log(`Example app listening at port 8080`);
});

function whitelist(...fields) {
  return (req, res, next) => {
    const body = req.body;

    for (const property in req.body) {
      if (!fields.includes(property)) delete req.body[property];
    }

    return next();
  };
}

function validate(...fields) {
  return (req, res, next) => {
    const body = req.body;

    if (fields.every(key => !!body[key])) {
      return next();
    }

    const missing = fields.filter(key => !body[key]);

    res.status(400).send(`${missing.toString()} is missing`);
  };
}
