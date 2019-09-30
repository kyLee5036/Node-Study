var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app2 = express();

// view engine setup
// view 폴더 지정
app2.set('views', path.join(__dirname, 'views'));
// engine을 지정 ( html을 pug로 대체)
app2.set('view engine', 'pug');

// use안에 들어있는것을 "미들웨어"
// 미들웨어가 express의 핵심이다!!!!!!


app2.use(logger('dev'));
app2.use(express.json());
app2.use(express.urlencoded({ extended: false }));
app2.use(cookieParser());
app2.use(express.static(path.join(__dirname, 'public')));

app2.use('/', indexRouter);
app2.use('/users', usersRouter);

// catch 404 and forward to error handler
app2.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app2.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app2.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app2;
