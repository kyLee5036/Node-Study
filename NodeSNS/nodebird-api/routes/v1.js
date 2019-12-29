// 1버전의 의미

const express = require('express');
const jwt = require('jsonwebtoken');

const { verifyToken } = require('./middlewares');
// 만들었던 DB
const { Domain, User, Post, Hashtag} = require('../models');

const router = express.Router();

//토큰을 발급할 것들
router.post('/token', async(req, res) => {
  const { clientSecret } = req.body;
  try {
    // 도메인에서 clientSecret가 맞는지 확인한다.
    const domain = await Domain.findOne({
      where: { clientSecret },
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
      expiresIn: '1s', // 1m : 1분 , 1s : 1시간
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

// verifyToken의 검정은 routes/middlewares.js에 있다
router.get('/test', verifyToken, (req, res) => {
  res.json(req.decoded);
});

module.exports = router

// 팁!!!
// API 서버의 응답 형식은 하나로 통일해주는게 좋다 (JSON 등)
// 또한, 에러 코드를 고유하게 지정해 에러가 뭔지 쉽게 알 수 있게 새주는 것이 좋다