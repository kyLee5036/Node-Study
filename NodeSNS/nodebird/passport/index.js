const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const { User } = require('../models');

module.exports = (passport) => {
    
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findOne({ 
            where: { id },
            // Followers랑 Followings은 middlewares.js의 정보를 들고온는 것이다.
            include: [{
                // 팔로워 데이트를 가져온다.
                model: User,
                attributes: ['id', 'nick'],
                as: 'Followers',
            }, {
                // 팔로잉 데이트를 가져온다.
                model: User,
                attributes: ['id', 'nick'],
                as: 'Followings',
            }]
        })
          .then(user => done(null, user))
          .catch(err => done(err));
    });


    local(passport);
    kakao(passport)
}


