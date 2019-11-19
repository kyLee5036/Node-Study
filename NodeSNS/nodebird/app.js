const express = require('express');
const cookieParse = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('flash');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.set('port', process.env.PORT || 8001);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParse('나중에 바꿀꺼임!!!메렁!!'));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: '나중에 바꿀꺼임!!!메렁!!',
    cookie: {
        httpOnly: true,
        secure: false,
    }
}));
app.use(flash());

app.listen(app.get('port'), () => {
    console.log(`${app.get('port')}번 포트에서 서버 실행중입니다.`);
})