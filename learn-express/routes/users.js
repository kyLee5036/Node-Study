var express = require('express');
var router = express.Router();


// Get/ users
router.get('/', (req, res) => {
  res.send('Hello Users');
});

// delete/ users
router.get('/delete', (req, res) => {
  res.send('Hello Users');
});


router.delete('/', (req, res) => {

});

module.exports = router;
