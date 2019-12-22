# Nodebird API

+ [API 서버의 개념과 필요성](#API-서버의-개념과-필요성)
+ [NodeBird-API 프로젝트 세팅하기](#NodeBird-API-프로젝트-세팅하기)
+ clientSecreet과 UUID


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


