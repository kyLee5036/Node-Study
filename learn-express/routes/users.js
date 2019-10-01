var express = require('express');
var router = express.Router();


// Get/ users
app.get('/', (req, res) => {
  res.send('Hello Users');
});


// delete/ users
app.get('/delete', (req, res) => {
  res.send('Hello Users');
});

module.exports = router;
