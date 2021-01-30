const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ObjectID } = require('mongodb');
const validator = require('email-validator');
const app = express();

let db;

app.use(cors());
app.use(bodyParser.json());

app.get('/users', async (req, res) => {
  const collection = db.collection('users');

  collection.find().toArray(function (err, results) {
    if (err) {
      res.status(500).send();
    }
    res.json(results);
  });
});

app.get('/users/:id', (req, res) => {
  const collection = db.collection('users');
  collection.findOne(
    {
      _id: new ObjectID(req.params.id),
    },
    function (err, result) {
      if (err) {
        res.status(404).send();
      }
      res.json(result);
    }
  );
});

app.delete('/users/:id', (req, res) => {
  const collection = db.collection('users');
  collection.remove(
    {
      _id: new ObjectID(req.params.id),
    },
    function (err, result) {
      if (err) {
        res.status(404).send();
      }
      res.status(200).send();
    }
  );
});

app.patch(
  '/users/:id',
  // validate('email', 'name', 'gender'),
  // whitelist('email', 'name', 'gender'),
  async (req, res) => {
    const collection = db.collection('users');
    const body = req.body;

    try {
      const _id = new ObjectID(req.params.id);

      let _user = await collection.findOne({ _id });

      const user = {
        email: body.email || _user.email,
        name: body.name || _user.name,
        gender: body.gender || _user.gender,
      };

      await collection.update({ _id }, user);

      res.send(user);
    } catch (error) {
      res.status(400).send();
    }
  }
);

app.post(
  '/users',
  // validate('email', 'name', 'gender'),
  (req, res) => {
    const body = req.body;
    const user = {
      email: body.email,
      name: body.name,
      gender: body.gender,
    };

    db.collection('users').insertOne(user, function (err, results) {
      if (err) {
        res.status(500).send();
      }

      res.json(results);
    });
  }
);

const server = app.listen(8080, function () {
  console.log(`Example app listening at port 8080`);

  MongoClient.connect('mongodb://localhost:27017', function (err, client) {
    if (err) {
      console.error('Failed to connect to mongodb');
      server.close();
      return;
    }

    console.log('Connected successfully to server');

    db = client.db('usersList');
  });
});

function whitelist(...fields) {
  return (req, res, next) => {
    const body = req.body;

    for (const property in body) {
      if (!fields.includes(property)) delete body[property];
    }

    return next();
  };
}

function validate(...fields) {
  return (req, res, next) => {
    const body = req.body;
    const { email, name, gender } = body;

    const currentUser = collection.findOne(
      {
        _id: new ObjectID(req.params.id),
      },
      function (err, result) {
        if (err) {
          res.status(404).send();
        }
        res.json(result);
      }
    );

    const regexNameValidate = /^[A-Za-z\s]+$/;

    if (
      (users.some(user => user.email === email) &&
        currentUser.email !== email) ||
      !validator.validate(email) ||
      !regexNameValidate.test(name) ||
      (gender.toLowerCase() !== 'male' && gender.toLowerCase() !== 'female')
    ) {
      return res.status(400).send();
    }

    if (fields.every(key => !!body[key])) {
      return next();
    }

    const missing = fields.filter(key => !body[key]);

    res.status(400).send(`${missing.toString()} is missing`);
  };
}

module.exports = app;
