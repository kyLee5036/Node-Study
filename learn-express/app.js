const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello express');
});

app.get('/users', (req, res) => {
  res.send('Hello Users');
});

app.post('/', (req, res) => {

});

module.exports = app;