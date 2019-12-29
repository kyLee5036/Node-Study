# Nodebird-call

+ [API 서버의 개념과 필요성](#API-서버의-개념과-필요성) - 생략
+ [NodeBird-API 프로젝트 세팅하기](#NodeBird-API-프로젝트-세팅하기) - 생략
+ [clientSecreet과 UUID](#clientSecreet과-UUID) - 생략
+ [JWT와 jsonwebtoken 패키지](#JWT와-jsonwebtoken-패키지) - 생략
+ [API 호출 서버 만들기](#API-호출-서버-만들기)


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

