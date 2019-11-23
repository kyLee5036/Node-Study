const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');

module.exports = (passport) => {

    // passport 로그인할 때 이것을 사용한다.
    // (Strategy(전략) - 누구를 로그인 시킬 것인가?)
    // kakaoStrategy, googleStrategy, facebookStrategy 등 있다.



    local(passport);
    kakao(passport)
}