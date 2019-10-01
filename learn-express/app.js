const express = require('express');
// logger 추가
const logger = require('morgan');
// cookeParse 추가
const cookiParser = require('cookie-parser');
// session 추가
const session = require('express-session');
// flash 추가
const flash = require('connect-flash');
// path 추가
const path = require('path');


const indexRouter = require('./routes/index');
const userRouter = require('./routes/users');

const app = express();


// logger적용시키기
// logger는 응답시간을 요청해준다
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({extended:false }));

// secret code는 비밀키 (일종의 비밀번호) , 세션의 시크릿이랑 같아야한다
app.use(cookiParser('secret code'));
app.use(session({
  // 요청이 들어오면 무조건 저장 ( 낭비좀 한다. resave, saveUninitialized )
  resave : false,
  saveUninitialized : false,
  secret : 'secret code',
  cookie : {
    httpOnly : true,
    secure : false,
  }
}));
app.use(flash());


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
app.use('/', indexRouter);
// 앞에 주소를 적어서 미리 "/users"를 사용한다
app.use('/users', userRouter);

// 없는 주소를 방지할려면 404처리 미들웨어!!
// error : 404 NOT FOUND
app.use( (req, res, next) => {
  res.status(404).send('NOT FOUND');
});

// error : 500 서버 에러
app.use(function(err, req, res, next) {
  console.log(err);
  res.status(500).send('SERVER ERR');
})




module.exports = app;