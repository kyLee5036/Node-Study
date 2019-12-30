const express = require('express');
const axios = require('axios');
const router = express.Router();

const URL = 'http://localhost:8002/v1';

// 토큰을 발급을 제대로 해주는 지 확인
// JWT토큰을 받아올 것이다.
// nodebird-call ----->> nodbird-api

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

// request 토큰 발급받는곳
// posts 게시물 가져오는 거
// hashtag 검색태그 가져오는 거

module.exports = router;
