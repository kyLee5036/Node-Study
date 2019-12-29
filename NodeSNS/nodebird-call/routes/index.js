const express = require('express');
const axios = require('axios');
const router = express.Router();

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

module.exports = router;

// axios는 다른 서버에 요청을 보내는 간단하고 유용한 라이브러리이다
// axios.메서드 (주소, 옵션)

// 순서가
// 세션에 토큰이 없으면 발급을 받고, 그 다음 세션에 토큰을 저장하고, 토큰 요청을 보낸다
// 하지만, 테스트할 떄 에러가 나올경우가 있다.
// 에러나올 경우에는 토큰이 만료가 되거나, 유효할 경우
// 