const express = require('express');

const { isLoggedIn } = require('./middlewares');
const { User } = require('../models');

const router = express.Router();
// 팔로워는 로그인 한 사람만 하게한다.
router.post('/:id/follow', isLoggedIn, async (req, res, next) => {  
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    console.log(user);
    await user.addFollowing(parseInt(req.params.id, 10));
    res.send('success');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/:id/unfollow', isLoggedIn, async (req, res, next) => {  
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    console.log(user);
    await user.removeFollowing(parseInt(req.params.id, 10));
    res.send('success');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 프로필 변경 기능
router.post('/profile', async ( req, res, next) => {
  try {
    await User.update({ nick: req.body.nick }, {
      where: {id: req.user.id},
    });
    res.redirect('/');
  } catch ( error) {
    console.error(error);
    next(error);
  }
});
module.exports = router;