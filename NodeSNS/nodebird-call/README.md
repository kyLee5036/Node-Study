# Nodebird-call

+ [API 서버의 개념과 필요성](#API-서버의-개념과-필요성) - 생략
+ [NodeBird-API 프로젝트 세팅하기](#NodeBird-API-프로젝트-세팅하기) - 생략
+ [clientSecreet과 UUID](#clientSecreet과-UUID) - 생략
+ [JWT와 jsonwebtoken 패키지](#JWT와-jsonwebtoken-패키지) - 생략
+ [API 호출 서버 만들기](#API-호출-서버-만들기)
+ [API 작성 및 호출하기](#API-작성-및-호출하기)
+ [스스로 해보기1(팔로잉, 팔로워 API)](#스스로-해보기1(팔로잉,-팔로워-API))


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