const jwt = require('jsonwebtoken');
const RateLimit = require('express-rate-limit');

// 로그인 성공여부
exports.isLoggedIn = (req, res, next) => {
    // isAuthenticated() 로그인 여부를 알려준다.
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(403).send('로그인 필요')
    }
}

// 로그인을 안 했을경우
exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
}

exports.verifyToken = (req, res, next) => {
    // try에서 검증시도
    try {
        // 검증할 때 JWT_SECREET이 필요하다. JWT_SECREET은 절대로 노출되어서 안된다.
        // 토큰요청은 http헤더의 authorization에 토큰을 넣어서 서버에 보낸다. 
        req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        return next();
    } catch (error) {
        // 유효하지 않을 때나 (내가 만든 토큰이 아닐 때), 토큰 유효 기간이 만료되었을 때 에러가 발생한다.
        if (error.name == 'TokenExpiredError') {
            // 토큰은 기간은 짧게주고 재 발급많이하는 방법도 좋다.
            // v1.js에 보면 [expiresIn: '1m'] 라는 것이 발급시간을 가리킨다.
            return res.status(419).json({
                code: 419,
                message: '토큰이 만료되었습니다.'
            });
        }
        return res.status(401).json({
            code: 401,
            message: '유효하지 않은 토큰입니다.'
        });
    }
}

// 사용량 제한 설정
exports.apiLimiter = new RateLimit({
    windowMs: 60 * 1000, // 이 시간 동안 
    max: 1, // 최대 횟수 
    delayMs: 0, // 요청 간 간격 ( 호출 간에 텀(간격)) 
    // --> 1초동안 한 번만 요청할 수 있다.
    handler(req, res) { // 위에 것을 어겼을 경우 메세지
        res.status(this.statusCode).json({
            code: this.statusCode, // 420 에러가 나온다.
            message: `1분에 한 번만 요청할 수 있습니다.`,
        })
    }
});

// v2(버전 2)를 시작하면 v1(버전 1)사용하지 못하게 한다.
exports.deprecated = ( req, res) => {
    res.status(410).json({
        code: 410,
        message: `새로운 버전이 나왔습니다. 새로운 버전을 사용하세요.`,
    })
}

// Tip인데 코드는 헷갈리지 않도록 정확하고 명확하게 해야한다.
// 지금은 마음대로 정한건데 나중에 개발하게 되면 정확하게 지정해야한다. 