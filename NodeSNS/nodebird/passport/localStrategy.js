const LocalStratgy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { User } = require('../models'); 

module.exports = (passport) => {
    passport.use(new LocalStratgy({
        usernameField: 'email', // req.body.email
        passwordField: 'password', // req.body.password
    }, async (email, password, done) => {
        try {
            const exUser = await User.find({ where : {email}});
            if (exUser) {
               const result = await bcrypt.compare(password, exUser.password);
                if (result) {
                    done(null, exUser);
                } else {
                    done(null, false, {message: '가입되지 않은 회원입니다.'});
                }
            } else {
                done(null, false, {message: '가입되지 않은 회원입니다.'});
            }
        } catch( error) {
            console.error(error);
            done(error);
        }
    }));
}