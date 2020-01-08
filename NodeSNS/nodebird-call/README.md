# Nodebird-call

+ [API 서버의 개념과 필요성](#API-서버의-개념과-필요성) - 생략
+ [NodeBird-API 프로젝트 세팅하기](#NodeBird-API-프로젝트-세팅하기) - 생략
+ [clientSecreet과 UUID](#clientSecreet과-UUID) - 생략
+ [JWT와 jsonwebtoken 패키지](#JWT와-jsonwebtoken-패키지) - 생략
+ [API 호출 서버 만들기](#API-호출-서버-만들기)
+ [API 작성 및 호출하기](#API-작성-및-호출하기)
+ [스스로 해보기1(팔로잉, 팔로워 API)](#스스로-해보기1(팔로잉,-팔로워-API))
+ [API 사용량 제한 구현하기](#API-사용량-제한-구현하기)
+ [CORS 해결하기](#CORS-해결하기)
+ [스스로 해보기2(무료/유료에 따라 사용량 차등 제한)](#스스로-해보기2(무료/유료에-따라-사용량-차등-제한))

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

#### nodebird-call/routes/index.js

axios는 다른 서버에 요청을 보내는 간단하고 유용한 라이브러리이다.<br>
<strong>axios.메서드 (주소, 옵션)</strong><br>
axios사용방법은 밑에 예제 예시에 대략으로 적혀져 있다.

```js
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/test', async (req, res, next) => {
  try {
    // 일단 세션에 토큰에 저장할 것이다.
    if (!req.session.jwt) { // 세션에 토큰이 없으면
      const tokenResult = await axios.post('http://localhost:8002/v1/token', {
        clientSecret: process.env.CLIENT_SECRET,
      });
      // 토큰을 가져와서 성공을 하는 경우
      if (tokenResult.data && tokenResult.data.code === 200) { // 토큰 발급 성공
        req.session.jwt = tokenResult.data.token; // 세션에 토큰 저장
      } else {
        // 실패할 경우
        // 실패했을 떄 데이터에 메러메세지가 들어있을 것이다. nodebird-api의 에러 메세지에 있다.
        return res.json(tokenResult.data); // 발급 실패 사유 응답
      }
      const result = await axios.get('http://localhost:8002/v1/test', {
        headers: { authorization: req.session.jwt },
      });
      return res.json(result.data);
    }
  } catch (error) {
    console.error(error);
    if (error.response.status === 419) { // 토큰 만료시 토큰 재발급 받기
      return res.json(error.response.data);
    } // 419 외의 다른 에러면
    return next(error);
  }
});

module.exports = router;

``` 
순서가 세션에 토큰이 없으면 발급을 받고, 그 다음 세션에 토큰을 저장하고, 토큰 요청을 보낸다.<br>
하지만, 테스트할 떄 에러가 나올경우가 있다.<br>
에러나올 경우에는 토큰이 만료가 되거나, 유효할 경우이다.<br><br>
나머지 views/error.pug, app.js 는 생략한다.<br>

#### nodebird-api/routes/middlewares.js

```js
exports.verifyToken = (req, res, next) => {
  // try에서 검증시도
  try {
      // 검증할 때 JWT_SECREET이 필요하다. JWT_SECREET은 절대로 노출되어서 안된다.
      // 토큰요청은 http헤더의 authorization에 토큰을 넣어서 서버에 보낸다. 
    req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
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

#### nodebird-api/routes/v1.js

```js
// verifyToken의 검정은 routes/middlewares.js에 있다
router.get('/test', verifyToken, (req, res) => {
  res.json(req.decoded);
});
```
nodebird-call이랑 연결할 수 있도록 라우터를 만든다.<br>

middlewares.js의 데이터가 v1.js에 전달한다. v1는 nodebird-call에 있는 routes의 test에 데이터들을 전달한다.

nodebird-api/routes/middlewares.js -> nodebird-api/routes/v1.js -> nodebird-call/routes/index.js의 "router.get('/test', "에 전달한다.

## API 작성 및 호출하기

코드를 보면 next(error)와 같은게 없을 것이다. 왜냐하면, json형태로 다 통일해줬기 때문이다. 그래야 나중에 유지보수할 때 어렵지가 않다.

#### nodebird-api/routes/v1.js
```js
... 내용생략

// 무조건 토큰부터 검사를 해야한다.

// 내가 작성한 게시글들을 불러온다.
router.get('/posts/my', verifyToken, (req, res) => {
  Post.findAll({ where: { userId: req.decoded.id } }) // 게시글을 다 겨온다.
    .then((posts) => { // 성공할 경우
      console.log(posts);
      res.json({ 
        code: 200,
        payload: posts,
      });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: `서버 에러`,
      })
    })
});

// 해시태그를 검색하는 기능
router.get('/posts/hashtag/:title', verifyToken, async(req, res) => {
  try {
    const hashtag = await Hashtag.findOne({ where: { title: req.params.title }});
    if (!hashtag) {
      return res.status(404).json({
        code: 401,
        message: '검색 결과가 없습니다.'
      });
    }
    const posts = await hashtag.getPosts();// 해시태그와 연관된 거 가져오기
    return res.json({
      code: 200,
      payload: posts,
    })
  } catch(error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: `서버 에러`,
    })
  }
});
```

nodebird-api에 추가를 해주었다. 그 다음에 nodebird-call에 네용들을 추가 해준다.

#### nodebird-call/routes/index.js
```js
...위 생략

// request함수는 세션발급받고, 이런 것들을 다 하는 것들이다.
const request = async (req, api) => {
  try {
    if (!req.session.jwt) { // 세션에 토큰이 없으면
      const tokenResult = await axios.post(`${URL}/token`, {
        clientSecret: process.env.CLIENT_SECRET, //clientSecret을 넣어야 JWT토큰을 받을 수 있다.
      });
      req.session.jwt = tokenResult.data.token; // 세션에 토큰 저장
    }
    return await axios.get(`${URL}${api}`, {
      headers: { authorization: req.session.jwt },
    }); // API 요청
  } catch (error) {
    if (error.response.status === 419) { // 토큰 만료시 토큰 재발급 받기
      delete req.session.jwt;
      return request(req, api);
    } // 419 외의 다른 에러면
    return error.response;
  }
}

// Call 서버 -> API 서버
// 여기서 request함수는 만들어줘야한다. 나중에 리펙토링하면서 만들어 줄거임!

// nodebird-api의 요청을 보낸다.
// /mypost -> /posts/my
// /mypost ----> nodebird-api의 /posts/my 요청(토큰)
router.get('/mypost', async(req, res, next) => {
  try {
    const result = await request(req, '/posts/my'); // posts/my 앞에 request가 있다. 
    // request의 메서드를 받아와서 `http://localhost:8002/v1${api}` // api가 post/my이 된다
    res.json(result.data);
  } catch ( error ) {
    console.error(error);
    next(error);
  }
});

// nodebird-api의 요청을 보낸다.
// /search -> /posts/hashtag
// /search/노드 ----> nodebird-api의 /posts/hashta/노드 요청(토큰)
router.get('/search/:hashtag', async(req, res, next) => {
  try {
    const result = await request(
      // encodeURIComponent는 주소에 한글사용하면 에러나오니까 막아주기 위해서 사용하였다. 
      req, `/posts/hashtag/${encodeURIComponent(req.params.hashtag)}`, 
    );
    res.json(result.data);
  } catch ( error ) {
    console.error(error);
    next(error);
  } 
});

... 이하 생략
```
request : 토큰 발급받는곳<br>
posts : 게시물 가져오는 거<br>
hashtag : 검색태그 가져오는 거<br>


## 스스로 해보기1(팔로잉, 팔로워 API)


#### nodebird-api/routes/v1.js

```js
... 위 생략

//팔로워 팔로잉 목록 API 만들기
router.get('/follow', verifyToken, async(req, res) => {
  try {
    const user = await User.findOne({ 
      where: {
        id: req.decoded.id
      }
    });
    const follower = await user.getFollowers({
      attributes: ['id', 'nick']
    });
    const following = await user.getFollowings({
      attributes: ['id', 'nick']
    });
    return res.json ({
      code: 200,
      follower,
      following,
    })
  } catch ( error ) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: `서버 에러`,
    });
  }
});
... 이하 생략
```

#### nodebird-cal/routes/index.js

```js
... 위 생략

router.get('/follow', async (req, res, next) => {
  try {
    const result = await request(
      req, `/follow`
    );
    res.json(result.data);
  } catch ( error ) {
    console.error(error);
    next(error);
  }
});
```

여기서 목록을 불러왔는데 비밀번호가 가져오게 된다.<br> 그래서 옵션으로 지정해야한다. <br>
시퀄라이즈 attributes 속성으로 원하는 컬럼만 가져올 수 있다.<br>

```js
const follower = await user.getFollowers({
  attributes: ['id', 'nick']
});
const following = await user.getFollowings({
  attributes: ['id', 'nick']
});
```
여기서 attributes를 보면 아이디랑, 닉네임만 가져오게 된다.


## API 사용량 제한 구현하기

Nodebird-api 서버를 고도화 시켜서 사용량 제한을 구현하고,<br>
call 서버에는 프론트에서 요청을 보내는 것을 구현할 것이다.

<pre><code>npm i express-rate-limit</code></pre>

#### nodebird-api/routes/middlewares.js
```js
const RateLimit = require('express-rate-limit');

...이하 생략


// 사용량 제한 설정
exports.apiLimiter = new RateLimit({
    windowMs: 60 * 1000, // 이 시간 동안 
    max: 1, // 최대 횟수 
    delayMs: 0, // 요청 간 간격 ( 호출 간에 텀(간격)) 
    // --> 1초동안 한 번만 요청할 수 있다.
    handler(req, res) { // 위에 것을 어겼을 경우 메세지
        res.status(this.statusCode).json({
            code: this.statusCode, // 420 에러가 나온다.
            message: `1분에 한 번만 요청할 수 있습니다.`,
        })
    }
});

// v2(버전 2)를 시작하면 v1(버전 1)사용하지 못하게 한다.
exports.deprecated = ( req, res) => {
    res.status(410).json({
        code: 410,
        message: `새로운 버전이 나왔습니다. 새로운 버전을 사용하세요.`,
    })
}

```
Tip인데 코드는 헷갈리지 않도록 정확하고 명확하게 해야한다.<br>
지금은 마음대로 정한건데 나중에 개발하게 되면 정확하게 지정해야한다. <br>

#### nodebird-api/routes/v1.js
```js
const { verifyToken, deprecated } = require('./middlewares');

router.use(deprecated); // 이 안에 모든 라우터는 deprecated 적용이 된다.

```
router.use(deprecated); 는 app.js에서 app.use(); 형식이랑 비슷하다. 즉, 모든 라우터에 적용하는 것이다. <br>
하지만, 여기 라우터만 작용되는 것이다.<br>

#### nodebird-api/routes/v2.js

```js
const express = require('express');
const jwt = require('jsonwebtoken');

const { verifyToken, apiLimiter } = require('./middlewares');
const { Domain, User, Post, Hashtag } = require('../models');
const router = express.Router();

router.post('/token', apiLimiter, async(req, res) => {
  ...동일
});

router.get('/test', apiLimiter, verifyToken, (req, res) => {
  res.json(req.decoded);
});


router.get('/posts/my',apiLimiter, verifyToken, (req, res) => {
  ...동일
});

router.get('/posts/hashtag/:title',apiLimiter, verifyToken, async(req, res) => {
  ...동일
});

router.get('/follow', apiLimiter, verifyToken, async(req, res) => {
  ...동일
});

module.exports = router;
```

일단 v2는 사용하는데 <strong>API 사용량 제한</strong> 걸기위해서 <strong>apiLimiter</strong>를 해주었다.<br> 
apiLimiter는 `./middlewares`에 따로 만들어 주었다.<br>

#### nodebird-call/rotes/index.js

```
const URL = 'http://localhost:8002/v2';
```
URL을 전부 v2를 지정해주면 끝이다. 그러면 v2가 실행이 된다.



## CORS 해결하기

혹시나, 오리진 -> (origin 의미)

<strong>CORS</strong>(cross origin resource sharing)<br>
> 프론트에서 다른 오리진의 서버로 요청을 보내면 에러 발생
localhost:8003을 오리진을 생각하면 localhost:8003을 localhost:8002에 요청을 보내면 CORS 위반이 된다.<br>

오리진이 부분이 다른데 요청을 보내면 에러가 걸린다. <br>
하지만, CORS에러가 항상 에러가 발생하지 않다. <br>
프론트에서 다른 오리진 서버에 요청을 보낼 때 에러가 걸린다. (프론트 -> 프론트)<br> 
서버에서 서버로 요청을 보낼 때에는  CORS에러가 안 나타난다.<br>
그래서 프록시 요청을 사용해서 극복하는 방법도 있다. 또는, 응답헤더에 뭔가 사용해서 해결할 수도 있다.<br>
에러내용이<br> 
<pre><code>Response to preflight request doesn`t pass access control check:
No `Access-Control-Allow-Origin` header is present on the requested resource.Origin</code></pre>

Access-Control-Allow-Origin 헤더를 응답 헤더에 넣어주면 된다.<br>

여기서 해결방법을 알아보자!<br>
<pre><code>npm i cors</code></pre>

대표적인 기본적 방법이 있다. (참고로 기본적인 방법이다. <br>
```js
router.use(cors()); // 솔직히 간편하게 라우터에 다 작용해서 해결해도 상관은 없다.
router.use(cors(`http://localhost:8003`)); // 내가 지정한 도메인만 넣어줘서 해결하는 방법도 있다. 
router.use(cors(`*`)); // 도메인을  전부 허용한다. 하지만 보안성 다른 방법도 있다.
```


커스터마이징 사용 전 (cors 사용방법) (위와 하는 방식이 비슷하다.)<br>
```js
// cors를 사용한다. 의미는 
router.use(cors()); // 단순하게 사용하지말고 커스터마이징 사용하는 방법도 있다.
```
여기서부터는 <strong>커스터마이징</strong>을 사용한다.

커스터마이징 사용 후 (cors 기본사용 방법)<br>
```js
router.use(async (req, res, next) => {
  cors()(req,res, next);
});
// 미들웨어 안에 미들웨어를 넣어 커스터마이징할 수 있다.
```
> 미들웨어 안에 미들웨어를 넣어 커스터마이징할 수 있다.

커스터마이징 사용 후 (cors 응용하는 방법)<br>
```js
router.use(async (req, res, next) => {
  const domain = await Domain.findOne({
    where: {
      // 먼저 뒷 부분에 host가 localhost:8003이다.
      host: url.parse(req.get('origin')).host 
      // 여기 의미가 nodebird-api에서 등록된 DB의 API만 도메인 주소를 사용하는 것을 허용해준다. 
      // 등록된 것만 허용된다. 
    },
  });
  // domain DB데이터에 등록 되어있으면 접근허용한다.
  if (domain) {
    cors({origin: req.get('origin')})(req,res, next);
  } else {
    next();
  }
});
```

크롬 개발자 툴(F12 -> Netword)을 보면
CORS 요청 시에는 OPTIONS 메서드 요청이 간다.<br>
Access`Control-Allow-Origin을 검사한다. <br>

먼저 OPTIONS를 검사먼저 한다.<br> Access-Control-Allow-Origin가 없으면 OPTIONS에 먼저 차단이 된다. <br>

등록할 떄 <strong>http://</strong>를 뺴고 등록해야 한다.<br>


#### nodebird-api/routes/v2.js
```js
const cors = require('cors');
const url = require('url');

...이하 생략

// cors를 사용한다. 의미는 
// router.use(cors()); // 단순하게 사용하지말고 커스터마이징 사용하는 방법도 있다.

router.use(async (req, res, next) => {
  const domain = await Domain.findOne({
    where: {
      // 먼저 뒷 부분에 host가 localhost:8003이다.
      host: url.parse(req.get('origin')).host 
      // 여기 의미가 nodebird-api에서 등록된 DB의 API만 도메인 주소를 사용하는 것을 허용해준다. 
      // 등록된 것만 허용된다. 
    },
  });
  // domain DB데이터에 등록 되어있으면 접근허용한다.
  if (domain) {
    cors({origin: req.get('origin')})(req,res, next);
  } else {
    next();
  }
});
// 미들웨어 안에 미들웨어를 넣어 커스터마이징할 수 있다.
```

## 스스로 해보기2(무료/유료에 따라 사용량 차등 제한)

구글 개발자 툴에 보면 clientSecret가 노출되어있다. 
clientSecret같은 서버용 키와 프론트용 키를 따로 발급해주는 것이 좋다. 

#### nodebird-api/routes/middlewares.js

유료, 무료 API 제한 설정
```js
// 사용량 제한 설정 (무료인거)
exports.apiLimiter = new RateLimit({
    windowMs: 60 * 1000, // 1분
    max: 100,
    delayMs: 0,
    handler(req, res) {
      res.status(this.statusCode).json({
        code: this.statusCode, // 기본값 429
        message: '무료 사용자는 1분에 한 번만 요청할 수 있습니다.',
      });
    },
  });

  // 유료인 API
exports.premiumAPiLimiter = new RateLimit({
    windowMs: 60 * 1000, // 1분
    max: 100,
    delayMs: 0,
    handler(req, res) {
      res.status(this.statusCode).json({
        code: this.statusCode, // 기본값 429
        message: '유료 사용자는 1분에 1000번 요청할 수 있습니다.',
      });
    },
  });
```

#### nodebird-api/routes/v2.js

```js

const { verifyToken, premiumAPiLimiter, apiLimiter } = require('./middlewares');

// API 유료 or 무료 검사하는 곳
router.use((req, res, next) => {
  const domain = await Domain.findOne({
    where: {host: url.parse(req.get('origin').host)},
  });
  if (domain.type === 'premium') {
    premiumAPiLimiter(req, res, next);
  } else {
    apiLimiter(req, res, next);
  }
});

// 그리고 이전에 router안에 apiLimiter를 다 지워줘야하는 것 잊지말기!!!
```
이전에 router안에 apiLimiter를 다 지워줘야하는 것 잊지말기!!!

바꾸기 전
```js
router.get('/posts/my', apiLimiter, verifyToken, (req, res) => {
```

바꾸기 후
```js
router.get('/posts/my', verifyToken, (req, res) => {
```


