# nodebird

+ [SNS(NodeBird) 프로젝트 구조 세팅](#SNS(NodeBird)-프로젝트-구조-세팅)
+ [dotenv 사용하기](#dotenv-사용하기)
+ [기본 라우터와 pug 파일 세팅](#기본-라우터와-pug-파일-세팅)
+ [모델,테이블 만들기](#모델,테이블-만들기)
+ [다대다 관계 이해하기](#다대다-관계-이해하기)
+ [passport 세팅과 passportLocal전력](#passport-세팅과-passportLocal전력)

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


## passport 세팅과 passportLocal전력 

### 1:1관계, 1:N관계, N:N관계(3가지 경우있음)

#### app.js

```javascript
...내용 생략
const indexRouter = require('./routes/page');
// const userRouter = require('./routes/user');

// *** DB 연결 (sequelize를 불러온다.) *** 
const { sequelize } = require('./models');

const app = express();
// *** DB 연결 ( DB를 사용한다. ) *** 
sequelize.sync();

app.set('view engine', 'pug');
...내용생략
```


<strong>1대1 관계</strong> : 주가 되는 것이 가장 먼저 나와야한다. (일단 예시 설명이라서 1대N관계 예시문이랑 내용이 똑같다.)

```javascript
db.User.hasOne(db.Post); // 사용자가 게시글을 가지고있다.
db.User.belongsTo(db.User); // 게시글은 사용자에게 속해 있다.
```

<strong>1대N 관계(1대다 관계)</strong> : 사용자 한 명이 게시글 여러개를 업로드 할 수 있다. 순서가 관계있음. 주가 되는 것이 가장 먼저 나와야한다.

```javascript
db.User.hasMany(db.Post); // 사용자가 게시글을 많이 가지고 있다.
db.Post.belongsTo(db.User); // 게시글은 사용자에게 속해 있다.
```

<strong>N대N 관계(다대다 관계)</strong> : 순서가 관계없다. <strong>belongsToMany</strong>으로 구분한다.<br>
<strong>through</strong>에는 새로 생기는 모델이름을 넣어준다 (매칭 테이블)<br>

1. 다대다 관계 ( 해시태그 ) - 다른 테이블을 2개 사용한다.<br> <strong>through</strong>에서 'PostHashtag'라는 테이블 만들어준다.
```javascript
db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag'});
db.Hashtag.belongsToMany(db.Post, { through: 'PostHashtag'});
```

<pre><code>예시
1번글 : 안녕하세요 #노드 #익스프레스
2번글 : 안녕하세요 #노드 #제이드
3번글 : 안녕하세요 #제이드 #퍼그

1번글 - 1
1번글 - 2
2번글 - 1
2번글 - 3
3번글 - 3
3번글 - 4

1. 노드
2. 익스프레스
3. 제이드
4. 퍼그
</code></pre>

<br>

2. 다대다 관계 (팔로잉, 팔로워 관계) - 같은 테이블을 2개 사용한다.<br>
여기서 알아야 할 점 : 서로 테이블 이름이 같다, 누가 팔로워인지 누가 팔로잉인지 모른다<br>
그래서 <strong>as</strong>랑 <strong>foreignKey</strong>가 나온다.<br>
Follow라는 테이블을 만들어주고 관계설정을 한다.

```javascript 
db.User.belongsToMany(db.User, {through: 'Follow', as: 'Followers', foreignKey: 'followingId'}); // 팔로워로 결정
db.User.belongsToMany(db.User, {through: 'Follow', as: 'Following', foreignKey: 'followerId'}); // 팔로잉으로 결정
```

<strong>as</strong> : 매칭 모델 이름<br>
<strong>foreignKey</strong> : 상대 테이블 아이디<br>
<strong>A.belongsToMany(B, {as: 'B_name', foreignKey: 'A_id' })</strong><br>

<pre><code>예시
 1. 제로
 2. 네로
 3. 히어로

 일반인(팔로워) - 유명인(팔로잉)
 1 - 2 : 제로가 네로를 팔로워한다. 
 1 - 3 : 제로가 히어로를 팔로워한다.
 2 - 3 : 네로가 히어로를 팔로워한다.
 3 - 1 : 히어로가 제로를 팔로워한다.
반대 입장에도 생각할 것!

 1. 제로
 2. 네로
 3. 히어로
</code></pre>

<br>

3. 다대다 관계 ( 좋아요 관계 )

```javascript 
db.User.belongsToMany(db.Post, {through: 'Like' });
db.Post.belongsToMany(db.User, {through: 'Like' });
```

## passport 세팅과 passportLocal전력

### <strong>bcrypt</strong> 오류해결

이거 설치하기 전에 bcrypt가 잘 안될 경우를 설명한다.
<pre><code>윈도우 검색창 -> powershell -> 관리자 권한 실행
PS C:\WINDOWS\system32> npm i -g windows-build-tools

...내용샹략

All done!

+ windows-build-tools@5.2.2
updated 1 package in 217.964s
</code></pre>
+ windows-build-tools@5.2.2 이 명령문이 절대적으로 나와야만 성공했다는 의미이다.<br>
(시간이 좀 걸려서 기다리도록 한다.)<br>

「npm i -g windows-build-tools」의 의미란? <br>
-> 윈도우에서 필수인 c, c++ 관련된 것들과 파이썬같은 것을 설치해서 다른 언어를 사용하는 라이브러리르 지원할 수 있게 해준다. <br>bcrypt는 속도 때문에 c++로 내부적으로 사용한다.

「npm i -g windows-build-tools」 설치완료를 하고나서 이하의 bcrypt를 실행하면 된다.
<pre><code>D:\_Node.js\_NodeStudy_inflearn\Node-Study\NodeSNS\nodebird>npm i bcrypt
+ bcrypt@3.0.7</code></pre>


### passport 세팅과 passportLocal전력

<pre><code>npm i passport passport-local passport-kakao</code></pre>


