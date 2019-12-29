# Nodebird API

+ [API 서버의 개념과 필요성](#API-서버의-개념과-필요성)
+ [NodeBird-API 프로젝트 세팅하기](#NodeBird-API-프로젝트-세팅하기)
+ [clientSecreet과 UUID](#clientSecreet과-UUID)
+ [JWT와 jsonwebtoken 패키지](#JWT와-jsonwebtoken-패키지)
+ [API 호출 서버 만들기](#API-호출-서버-만들기)


## API 서버의 개념과 필요성
[위로가기](#Nodebird-API)

Application (어플리케이션) <br>
Programming (프로그래밍) <br>
Interface (창구, 상호간의 얼굴같은 느낌?) <br>

<strong>API</strong>는 남이 만든 코드를 사용할 수 있게 해주는 창구<br> 
즉, 쉽게 남이 만들어 둔 서버쪽 코드를 쓸 수 있는 것이다.<br> 
남이 만들어 둔 코드라고하면 라이브러리 생각하는데, 그런거 말고도 남이 만들어둔 API코드를 사용할 수 있다. 대신에 제약조건있다. 해줄 수 있는 만큼만 사용할 수있다.  결국에는, 그 API를 만든 것만 쓸 수 있다. NordBird서버도 API서버라고 할 수있다.<br> 
참고로) nodebird코딩할 때에 restAPI(post, get, delete, petch, put) 규칙에 따라서 코딩을 했었다. <br><br>

1. 궁금점!! API서버는 왜 필요할까? <br>
그것도 일종에 API서버라고 할 수있다. 만들어주면 좋은 점은 보여주고 싶은 API랑 보여주고 싶지 않은 API들은 안 보여줄 수있다. <br>예로들면 게시글API를 보여주는 것은 되는데 관리자권한 API를 안 보여줄 수 있다는 것이다. 여기서 <strong>크롤링</strong>문제도 있다.<br> 
게시글같은 것들을 API를 안해놓으면 사람들이 억지로 가져갈려고 크롤링을 할 경우도 있다. 크롤링하면 서버에 많은 부담이 간다. 그렇다면 크롤링으로 서버부담 주지말고, 내가 만들어준 API로 게시글이나 댓글들을 합법적으로 가져갈 수 있게한다. 그리고 통제권한이 나에게 있어서 편하다.<br>

2. 궁금점!! routes도 서버인데 왜 별도로 API서버를 만드냐고?<br>
서버를 나누면 좋은게 nodebird-api가 고장나면 본체인 nodebird서버가 돌아간다. 이렇게 계속 서버를 나누고 분리하는 것이 <strong>마이크로서비스 아키텍처</strong>라고 한다. <br>하지만 단점도 있다. 너무 많이 나누고 분리하면 에러추적하기 힘들고, 로그분석이 힘들다. 그렇다면 적당히 서버를 나누는게 좋다. 

localhost:8001(NodeBird) : 앱 <br>
localhost:8002(NodeBird-API) : API 서버 <br>
localhost:8003(NodeBird-Call) : 클라이언트 <br>

이 세개의 서버를 동시에 소통할 수도 있다. DB는 MySQL을 사용할 것이다.

## NodeBird-API 프로젝트 세팅하기
[위로가기](#Nodebird-API)

<pre><code>npm init

npm i bcrypt connect-flash cookie-parser dotenv express express-session morgan mysql2 passport passport-kakao passport-local pug sequelize uuid

+ bcrypt@3.0.7
+ express-session@1.17.0
+ dotenv@8.2.0
+ mysql2@2.0.2
+ morgan@1.9.1
+ connect-flash@0.1.1
+ cookie-parser@1.4.4
+ express@4.17.1
+ passport@0.4.1
+ passport-kakao@1.0.0
+ passport-local@1.0.0
+ pug@2.0.4
+ uuid@3.3.3
+ sequelize@5.21.3 (버전중요!!!!)

npm i -D nodemon
+ nodemon@2.0.2
</code></pre>

이번에는 개발자가 되어서 키 발급할 것을 만들어주고, 플랫폼들도 만들것이다!<br><br>

사용자에게 발급할 시크릿키와 도메인주소를 저장할 Domain모델을 만들어준다.
#### models/domain.js
```js
// 도메인 테이블
// 카카오 개발자 같은 것을 만들거라서 도메인 테이블을 만든다.
module.exports = (sequelize, DataTypes) => (
  sequelize.define('domain', {
    // API를 쓸수 있는 것
    host: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    // 유료 사용자, 무료 사용자 구분
    type: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    // 카카오에서 발급받은 비밀 키
    clientSecret: {
      type: DataTypes.STRING(40),
      allowNull: false,
    }
  }, {
    timestamps: true, // 생성일, 수정일
    paranoid: true, // 삭제일
    validate: { // 더 엄격하게 검증하는 거, 
      unknowType() { // 마음대로 이름정해도 상관없다.
        // free나 premium 중에 아니면 디비에 저장이 안된다!
        if ( this.type === 'free' && this.type !== 'premium') {
          throw new Error('type 컬럼은 free거나 premium이어야 한다.');
        }
      }
    },
  })
);
```

#### models/index.js

DB 관계설정 및 연결
```js
.. 생략
db.Domain = require('./domain')(sequelize, Sequelize);
...생략
db.User.hasMany(db.Domain);
db.Domain.belongsTo(db.User);
```

#### routes/index.js

```js
const express = require('express');

const { User, Domain } = require('../models');
const router = express.Router();

router.get('/', (req, res, next) => {
  User.findOne({
    where: { id: req.user && req.user.id || null },
    include: { model: Domain },
  })
    .then((user) => {
      res.render('login', {
        user,
        loginError: req.flash('loginError'),
        domains: user && user.domains,
      });
    })
    .catch((error) => {
      next(error);
    });
});
module.exports = router;
```

그 이외에는 자기가 알아서 추가할 것!!

## clientSecreet과 UUID

[위로가기](#Nodebird-API)

여기서 로그인은 노드버드로 가입했던 걸로 하면된다.<br><br>

clientSecreet라는 것을 만들어 그 값을 UUID에 넣어 줄 것이다.<br>
UUID : 고유한 값을 만들어주는 패키지이다<br>
```js 
const uuidv4 = require('uuid/v4'); // 4버전
...생략

// 도메인 만드는 것
router.post('/domain', (req, res, next) => {
  Domain.create({
    userId: req.user.id,
    host: req.body.host,
    type: req.body.type,
    clientSecret: uuidv4(), // 비밀키를 발급해주는 것
    // 여기서 비밀키는 안 겹치게 해야한다. 
  })
    .then(() => {
      res.redirect('/');
    })
    .catch((error) => {
      next(error);
    });
});
```
도메인 주소에 입력 값은 : http://localhost:8003으로 한다.<br>
http://localhost:8003을 접속해서 클라이언트 비밀 키를 사용해서 서버로 요청 보내면 그 서버가 API 요청을 해준다. 만약에 도메인 주소나 클라이언트 비밀 키가 틀리면 접속을 금지한다.<br>
여기 API서버에는 게시글이나, 해시태글등의 데이터를 가져올 수 있도록할 것이다.

## JWT와 jsonwebtoken 패키지

토큰을 만들어주는 패키지를 먼저 설치를 한다.<br>
토큰은 서버인증할 때 필요하다.<br>
<pre><code>npm i jsonwebtoken</code></pre>

#### .env 파일
<pre><code>JWT_SECRET=토큰비밀번호</code></pre>

.env에다가 JWT_SECRET하는 이유는 토큰 비밀번호가 노출되면 내 토큰인척해서 내 서버를 다른 사람이 사용해서 내 서버를 멋대로 인증하거나 사용하기 떄문이다.<br>
JWT는 프론트나 서버 둘 다에서 인증 용도로 사용가능하다.<br>
clientSecreet은 프론트 불가<br>
JWT는 해커에게 털려도 해커가 맘대로 이용할 수 없다.<br>

사용방법(코드설명에 있음)
#### routes/middlewares.js
```js
// 토큰을 연결해줘야 한다
const jwt = require('jsonwebtoken');

// 로그인 성공여부
exports.isLoggedIn = (req, res, next) => {
  if ( req.isAuthenticated()) { // isAuthenticated() 로그인 여부를 알려준다.
      next();
  } else {
      res.status(403).send('로그인 필요')
  }
}

// 로그인을 안 했을경우
exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
      next();
  } else {
      res.redirect('/');
  }
}

// 인증을 해준다.
exports.verify = (req, res, next) => {
  
  try { // try에서 검증시도
    // 여기에서 토큰 인증시도한다. 
    req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECREET);
    // 검증할 때 JWT_SECREET이 필요하다. JWT_SECREET은 절대로 노출되어서 안된다.
    // 토큰요청은 http헤더의 authorization에 토큰을 넣어서 서버에 보낸다. 
    return next();
  } catch (error) {
    // 유효하지 않을 때나 (내가 만든 토큰이 아닐 때), 토큰 유효 기간이 만료되었을 때 에러가 발생한다.
    if (error.name == 'TokenExpiredError') {
      // 토큰은 기간은 짧게주고 재 발급많이하는 방법도 좋다.
      // v1.js에 보면 [expiresIn: '1m'] 라는 것이 발급시간을 가리킨다.
      return res.status(419).json({
          code: 419,
          message: '토큰이 만료되었습니다.'
      });
    }
    return res.status(401).json({
        code: 401,
        message: '유효하지 않은 토큰입니다.'
    });
  }
}
```
isAuthenticated() : isAuthenticated()라는 메서드가 로그인 여부를 알려준다.

```js
req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECREET);
```
여기에서 토큰 인증시도한다.<br>
검증할 때 JWT_SECREET이 필요하다. JWT_SECREET은 절대로 노출되어서 안된다.<br>
토큰요청은 http헤더의 authorization에 토큰을 넣어서 서버에 보낸다. <br>
(개발자 도구에 열고 network -> header쪽을 보면 authorization라는 것이 있다)<br>

```js
// 유효하지 않을 때나 (내가 만든 토큰이 아닐 때), 토큰 유효 기간이 만료되었을 때 에러가 발생한다.
if (error.name == 'TokenExpiredError') {
  // 토큰은 기간은 짧게주고 재 발급많이하는 방법도 좋다.
  // v1.js에 보면 [expiresIn: '1m'] 라는 것이 발급시간을 가리킨다.
  return res.status(419).json({
      code: 419,
      message: '토큰이 만료되었습니다.'
  });
}
return res.status(401).json({
    code: 401,
    message: '유효하지 않은 토큰입니다.'
});
}
```
error.name == 'TokenExpiredError' : 토큰 에러나 유료기간이 만료되었을 떄 해주는 것이다.<br>
v1.js에 보면 발급시간이 있는데 발급시간이 지나가버리면 메세지에 '토큰이 만료되었습니다.'라고 메세지 출력한다.<br>
만료되지 않고 유효하지 않은 토큰이라면 '유효하지 않은 토큰입니다'라는 메세지 출력한다.<br>

#### routes/v1.js (여기서 v1은 버전 1의 의미이다.)

나중에 버전 적용하기 위해서 v2라는 버전2라는 것도 만들것이다. 

```js
// 1버전의 의미

const express = require('express');
const jwt = require('jsonwebtoken');

const { verifyToken } = require('./middlewares');
// 만들었던 DB
const { Domain, User, Post, Hashtag} = require('../models');

const router = express.Router();

//토큰을 발급할 것들
router.post('/token', async(req, res) => {
  const { clientSecreet } = req.body;
  try {
    // 도메인에서 clientSecreet가 맞는지 확인한다.
    const domain = await Domain.findOne({ 
      where: { clientSecreet },
      include: {
        model: User,
        attribute: ['nick', 'id'],
      },
    });
    // 도메인이 틀린경우에는 에러 메세지
    if ( !domain ) {
      return res.status(401).json({
        code: 401,
        message: '등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요.',
      });
    }
    // 발급한 토큰
    // jwt.sign 메서드 안에서 jwt토큰을 발급할 수 있다.
    // sing안에는 클라이언트 발급한 아이디, 닉네임이 받아온다
    // 그리고 JWT_SECRET이 필요하다, 하지만 절대로 유출해서는 안된다
    const token = jwt.sign({
      id: domain.user.ud,
      nick: domain.user.nick,
    }, process.env.JWT_SECRET, {
      expiresIn: '1m', // 1분, 1s : 1시간
      issuer: 'nodebird', // 발급자
    });
    return res.json({
      code: 200,
      message: '토큰이 발급되었습니다',
      token,
    });
    // 여기 catch 경우에서 next(error) 해주는데 뭔가 이상하다 !!
    // 왜? 응답을 JSON으로 통일하기 위해서이다!! next(error)하면 HTML을 렌더링해주기 때문에
    // JSON통일하기위해서 next(error)를 사용하지 않았다.
  } catch ( error ) {
    return res.status(500).json({
      code: 500,
      message: '서버 에러'
    })
  }
});

module.exports = router
```

> 팁!!!<br>
> API 서버의 응답 형식은 하나로 통일해주는게 좋다 (JSON 등)<br>
> 또한, 에러 코드를 고유하게 지정해 에러가 뭔지 쉽게 알 수 있게 새주는 것이 좋다

```JS
...위 생략
// 발급한 토큰
const token = jwt.sign({ // jwt.sign 메서드 안에서 jwt토큰을 발급할 수 있다.
  id: domain.user.ud, // sing안에는 내가 지정한 클라이언트 발급한 아이디, 닉네임이 받아온다
  nick: domain.user.nick,
}, process.env.JWT_SECRET, { // JWT_SECRET는 필요하다, 절대로 유출해서는 안된다
  expiresIn: '1m', // 1분, 1s : 1시간
  issuer: 'nodebird', // 발급자
});
return res.json({
  code: 200,
  message: '토큰이 발급되었습니다',
  token,
});
// 여기 catch 경우에서 next(error) 해주는데 뭔가 이상하다 !!
// 왜? 응답을 JSON으로 통일하기 위해서이다!! next(error)하면 HTML을 렌더링해주기 때문에
// JSON통일하기위해서 next(error)를 사용하지 않았다.
} catch ( error ) {
  return res.status(500).json({
    code: 500,
    message: '서버 에러'
  })
}
```
<br>

```js
catch ( error ) {
  return res.status(500).json({
    code: 500,
    message: '서버 에러'
  })
}
```
catch부문에서 next(error)를 하지않는 이유는 : JSON형식으로 통일해주기 위해서 안해주었다.<br>
next(error)를 한다면, HTML을 렌더링해주기 떄문이다.<br>

JWT 토큰 내용은 다 보이므로 민감한 내용은 저장하지 않는다.<br>
대신 변조할 수 없으므로 믿고 사용해도 된다.<br>
https://jwt.io<br>
위 사이트에 들어가서 볼 수가 있다.<br>

#### app.js
```js
const v1 = require('./routes/v1');

...아래 생략

app.use('/v1', v1);
```
추가를 해준다.

## API 호출 서버 만들기

Nodebird-call 이라는 API 호출 서버(클라이언트)를 만들 것이다.<br>
JWT 토큰을 발급해주는 서버(nodebird-api)를 만들어준다, <br>
<pre><code>npm i cookie-parser dotenv express express-session morgan pug
npm i -D nodemon
</code></pre>

이번 프로젝트에서는 <strong>axios</strong>가 들어간다.
<code><pre>npm i axios</code></pre>
제일 중요한 패키지인데, 다른서버에게 쉽게 요청을 보낼 수 있는 것이다.<br>

#### .env
nodebird-api에서 내가 발급받은 것을 넣어줘야한다.
```js
CLIENT_SECRET = 내가 발급받은 JWT토큰
```

#### nodebird-api/routes/v1.js

```js
// verifyToken의 검정은 routes/middlewares.js에 있다
router.get('/test', verifyToken, (req, res) => {
  res.json(req.decoded);
});
```
nodebird-call이랑 연결할 수 있도록 라우터를 만든다.

#### nodebird-call/routes/index.js

axios는 다른 서버에 요청을 보내는 간단하고 유용한 라이브러리이다.<br>
<strong>axios.메서드 (주소, 옵션)</strong><br>
axios사용방법은 밑에 예제 예시에 대략으로 적혀져 있다.

```js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// 토큰을 발급을 제대로 해주는 지 확인
// JWT토큰을 받아올 것이다.
// nodebird-call ----->> nodbird-api
router.get('/test', async(req, res, next) => {
  try {
    // 일단 세션에 토큰에 저장할 예정이다
    if (!req.session.jwt) { // 세션에 토큰이 없으면
      const tokenResult = await axios.post('http://localhost:8002/v1/token', {
        clientSecret: process.env.CLIENT_SECRET,
      });
      // 토큰을 가져와서 성공을 하는 경우
      if (tokenResult.data && tokenResult.data.code == 200 ) {
        // 세션에 토큰을 저장한다.
        req.session.jwt = tokenResult.data.token;
      } else { // 실패했을 떄 데이터에 메러메세지가 들어있을 것이다. nodebird-api의 에러 메세지에 있다.
        return res.json(tokenResult.data);
      }
      const result = await axios.get('http://localhost:8002/v1/test', {
        headers: {authorization: req.session.jwt },
      });
      return res.json(result.data);
    }
  } catch (error) {
    if (error.response.status === 419) { // 토큰 만료시 토큰 재발급 받기
      delete req.session.jwt;
      return request(req, api);
    } // 419 외의 다른 에러면
    return error.response;
  }
});

module.exports = router;

``` 
순서가 세션에 토큰이 없으면 발급을 받고, 그 다음 세션에 토큰을 저장하고, 토큰 요청을 보낸다.<br>
하지만, 테스트할 떄 에러가 나올경우가 있다.<br>
에러나올 경우에는 토큰이 만료가 되거나, 유효할 경우이다.<br><br>
나머지 views/error.pug, app.js 는 생략한다.<br>

