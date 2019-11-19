# nodebird

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
```javascript
// dotenv파일을 설정해준다.
require('dotenv').config();

// process.env로 불러온다.
app.use(cookieParse(process.env.COOKIE_SECRET));
secret: process.env.COOKIE_SECRET,
```
