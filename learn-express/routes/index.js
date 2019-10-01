var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/', (req, res, next) => {
  console.log("세번째 미들웨어");
  res.send('Hello express');
  next();
});
router.post('/', (req, res) => {

});

module.exports = router;
