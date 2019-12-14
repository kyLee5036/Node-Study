const express = require('express');
const router = express.Router();
const { Post, User } = require('../models');

const { isLoggedIn, isNotLoggedIn} = require('./middlewares')

// 프로필 페이지
router.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile', {
        title: '내 정보 - NodeBird', 
        user: null,
    })
});

// 회원가입 페이지
router.get('/join', isNotLoggedIn, (req, res) => {
    res.render('join', {
        title: '회원가입 - NodeBird',
        user : req.user,
        // 에러를 보여주기 위해서 따로 설정을 해주었다.
        joinError: req.flash('joinError'), //일회성 메세지들 보여주기위해 에러 넣음
    })
});

// 메인 페이지
router.get('/', (req, res, next) => {
    // Post에서 모든 것을 찾으면서 게시글 작성자 모델과 include로 연결해주고  
    Post.findAll({
        include: {
            model : User,
            attributes: ['id', 'nick'], // 아이디랑 닉네임의 값을 가져온다.
        },
    })
    // 정보가 posts에 담겨서 twits에 post를 해준다.
    // 렌더링할 떄 사용자와 게시글들이랑 같이 렌더링한다.
    .then((posts) => {
        res.render('main', {
            title: 'NodeBird',
            twits: posts,
            user: req.user,
            loginError: req.flash('loginError'), //일회성 메세지들 보여주기위해 에러 넣음
        })
    })
    .catch((error) => {
        console.error(error);
        next(error);
    })
});

module.exports = router;