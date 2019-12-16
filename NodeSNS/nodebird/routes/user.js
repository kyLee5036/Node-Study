const express = require('express');

const { isLoggedIn } = require('./middlewares');
const { User } = require('../models');

const router = express.Router();
// 팔로워는 로그인 한 사람만 하게한다.
router.post('/:id/follow', isLoggedIn, async (req, res, next) => {  try {
    // 현재 로그인 한 사람을 찾는다.
    const user = await User.findOne({ where: { id: req.user.id } });
    console.log(user);
    // A.addB : 관계생성
    // 나에 팔로잉 대상으로 추가를 한다.
    await user.addFollowing(parseInt(req.params.id, 10));
    res.send('success');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;