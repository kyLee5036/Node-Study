const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport')
const { User } = require('../models');

const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const router = express.Router();

// POST /auth/join (회원가입)
router.post('/join', isNotLoggedIn, async (req, res, next) => {
    const { email, nick, password} = req.body;
    try {
        const exUser = await User.find({ where : {email}});
        if (exUser) {
            req.flash('joinError', '이미 가입된 이메일입니다');
            return res.redirect('/join');
        }
        console.time('암호화 시간');
        const hash = await bcrypt.hash(password, 17);
        console.timeEnd('암호화 시간');
        await User.create({
            email,
            nick,
            password: hash,
        });
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }

})

// POST /auth/login
router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
        if(authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            req.flash('loginError', info.message);
            return res.redirect('/');
        }
        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }    
            return res.redirect('/');
        });
    })(req, res, next);
})

// Get /auth/logout
router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    res.redirect('/');
})

module.exports = router;