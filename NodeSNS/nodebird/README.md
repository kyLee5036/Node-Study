# nodebird

+ [SNS(NodeBird) 프로젝트 구조 세팅](#SNS(NodeBird)-프로젝트-구조-세팅)
+ [dotenv 사용하기](#dotenv-사용하기)
+ [기본 라우터와 pug 파일 세팅](#기본-라우터와-pug-파일-세팅)
+ [모델/테이블 만들기](#모델/테이블-만들기)

## SNS(NodeBird) 프로젝트 구조 세팅

#### package.json
```javascript 
"scripts": {
    "start": "nodemon app"
},
```
설정해준다. 나중에 nodemon에 대해서 설명함.

<pre><code><strong>npm i -g sequlize-cli</strong> 
+ sequelize-cli@5.5.1
</code></pre>
시퀄라이즈라이는 명령어 사용가능

<pre><code><strong>npm i sequelize mysql2</strong>
+ mysql2@2.0.0
+ sequelize@5.21.2
</code></pre>

<pre><code><strong>sequelize init</strong>
Created "config\config.json"
Successfully created models folder at "D:\_Node.js\_NodeStudy_inflearn\Node-Study\NodeSNS\nodebird\models".
Successfully created migrations folder at "D:\_Node.js\_NodeStudy_inflearn\Node-Study\NodeSNS\nodebird\migrations".
Successfully created seeders folder at "D:\_Node.js\_NodeStudy_inflearn\Node-Study\NodeSNS\nodebird\seeders".
</code></pre>
추가적으로 config, models, migrations, seeders 폴더가 생긴다.

1. 데이터베이스를 만들어준다. (config.json에서 설정)

<pre><code><strong>sequelize db:create</strong>     
Database nodebird created.</code></pre>

<pre><code><strong>npm i -D nodemon</strong>   
+ nodemon@1.19.4</code></pre>
nodemon은 서버 코드가 바뀌는 걸 알아서 재시작해준다. (개발할 때 편리하다.)

<pre><code><strong>npm i -g nodemon</strong>   
+ nodemon@1.19.4</code></pre>
전역설치도 해줘야한다.


<pre><code><strong>npm i express cookie-parser express-session morgan flash connect-flash pug</strong>
+ morgan@1.9.1
+ connect-flash@0.1.1
+ pug@2.0.4
+ express-session@1.17.0
+ express@4.17.1
+ cookie-parser@1.4.4
</code></pre>
body-parser는 필요가 없다. body-parser를 쓰면 좀 오래된 거다.

#### app.js
```javascript
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.set('port', process.env.PORT || 8001);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParse('나중에 바꿀꺼임!!!메렁!!secret의 내용이랑 같아야함'));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: '나중에 바꿀꺼임!!!메렁!!cookieParse의 내용이랑 같아야함',
    cookie: {
        httpOnly: true,
        secure: false,
    }
}));
app.use(flash());

app.listen(app.get('port'), () => {
    console.log(`${app.get('port')}번 포트에서 서버 실행중입니다.`);
})
```


## dotenv 사용하기

dotenv(.env)파일은 비밀파일이다. (절대로 온라인에 올리면 안된다.!!!)<br>
비밀번호를 다 .env파일에 적어두고 관리를 조심스럽게 하면 된다.
<pre><code><strong>npm i dotenv</strong>
+ dotenv@8.2.0
</code></pre>

#### .env
```javascript
COOKIE_SECRET=나는 비밀키이다!!!!하지만 비밀키이다!! 
PORT=나는 포트번호다!!!!하지만 비밀키이다
```

#### app.js

<strong>views의 pug들은 생략하겠음.</strong>

```javascript
// dotenv파일을 설정해준다.
require('dotenv').config();

// process.env로 불러온다.
app.use(cookieParse(process.env.COOKIE_SECRET));
secret: process.env.COOKIE_SECRET,
```

## 기본 라우터와 pug 파일 세팅

#### app.js

```javascript
// 라우터 셋팅
const indexRouter = require('./routes/page'); // page가 index로 보면 됨


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.set('port', process.env.PORT || 8001);


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
```

#### routes/page.js

page.js에서 참고

## 모델/테이블 만들기

-> 테이블 : models에다가 파일을 만든다. <br>
models의 테이블 정의

#### models/index.js

```javascript
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

const sequelize = new Sequelize(
  config.database, config.username, config,password, config,
);


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
```
최신버전으로 바꾸어 주었다.

#### models/user.js
```javascript
// 사용자 테이블

module.exports = ( (sequlize, DataTypes) => (
    // 테이블 user 정의
    sequlize.define( 'user', {
        email : {
            type: DataTypes.STRING(40),
            allowNull : false,
            unique: true,
        },
        nick : {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: true, // 카카오 로그인 위해서 true를 해준다. 나중에 데이터베이스 확인할 것.
        },
        // provider는 local과 kakao 구분하기 위해서
        provider: {
            type:DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'local',
        },
        snsID: {
            type: DataTypes.STRING(30),
            allowNull: true,
        }
    }, {
        timestamps : true,
        paranoid : true,
    })
));


```

대표적으로 user.js 하나만 설명한다.<br>
<strong>timestamps</strong> : 생성일, 수정일<br>
<strong>tparanoid</strong> : 삭제일 (복구일) -> 이걸하면 복구를 할 수있다.<br>

여기에서 <strong>password에 null이 허용</strong> 하는 이유는 : 카카오 로그인에 패스워드가 null이 되기때문에, <br>
즉, 카카오 로그인하면 패스워드는 카카오에서 관리를 한다.<br>
<strong>provider</strong>는 local과 kakao 구분하기 위해서 ( 그 외에도 구글, 깃허브 구분도 가능)