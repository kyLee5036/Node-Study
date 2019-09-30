const express = require('express');
// logger 추가
const logger = require('morgan');
const app = express();


// logger적용시키기
// logger는 응답시간을 요청해준다
app.use(logger('dev'));

app.use((req, res, next) => {
  console.log("첫번째 미들웨어");
  next();
});

app.use((req, res, next) => {
  console.log("두번째 미들웨어");
  next();
});

// next 안했으니까 여기에서 끝난다!!!!!!!
// "/" 라우팅 미들웨어라고 한다
app.get('/', (req, res) => {
  console.log("세번째 미들웨어");
  res.send('Hello express');
});

app.get('/users', (req, res) => {
  res.send('Hello Users');
});

app.post('/', (req, res) => {

});

app.delete('delete', (req, res) => {

});

module.exports = app;