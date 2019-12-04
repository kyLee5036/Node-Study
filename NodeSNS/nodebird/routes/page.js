const express = require('express');
const router = express.Router();

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
    res.render('main', {
        title: 'NodeBird',
        twits: [],
        user: req.user,
        loginError: req.flash('loginError'), //일회성 메세지들 보여주기위해 에러 넣음
    })
});

module.exports = router;