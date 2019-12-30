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
    const token = jwt.sign({
      id: domain.user.id,
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

module.exports = router
