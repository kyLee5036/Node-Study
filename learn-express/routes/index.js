var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
  console.log("세번째 미들웨어");
  res.render('test');
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/', (req, res) => {

});

router.delete('/', (req, res) => {

});

module.exports = router;