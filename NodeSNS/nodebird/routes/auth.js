const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models');

const router = express.Router();

// POST /auth/join (회원가입)
router.post('/join', async (req, res, next) => {
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
router.post('/login', (req, res, next) => {

})

module.exports = router;