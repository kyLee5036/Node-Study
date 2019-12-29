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


