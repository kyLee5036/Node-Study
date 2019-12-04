const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
require('dotenv').config();

const indexRouter = require('./routes/page');
const authRouter = require('./routes/auth')
const userRouter = require('./routes/user');

// const { sequelize } = require('./models');
const sequelize = require('./models').sequelize;

//passport 연결
const passportConfig = require('./passport');

const app = express();

sequelize.sync();
passportConfig(passport);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.set('port', process.env.PORT || 8001);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    }
}));
app.use(flash());

// passprot 연결 (미들웨어도 있다) app.use(session) 보다 아래에 있어야 한다.
// passport 설정들을 초기화
app.use(passport.initialize());
// 로그인할 때 사용자 정보와 같은 것들을 저장한다.
app.use(passport.session());


app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter);


// 404 에러처리
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// 500 에러처리
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});



app.listen(app.get('port'), () => {
    console.log(`${app.get('port')}번 포트에서 서버 실행중입니다.`);
})