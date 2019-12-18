const express = require('express');
const multer = require('multer');
const path = require('path');

const {User, Post, Hashtag} = require('../models');
const {isLoggedIn} = require('./middlewares');

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
    },
  }),
  limit: {
    fileSize: 5 * 1024 * 1024
  },
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
  console.log(req.file);
  res.json({
    url: `/img/${req.file.filename}`
  });
});

const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    // 게시글 생성
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url, 
      userId: req.user.id, // userID는 게시글 작성하면 게시글 작성자이다.
    });
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(hashtags.map(tag => Hashtag.findOrCreate({
        where: {
          title: tag.slice(1).toLowerCase()
        },
      })));

      await post.addHashtags(result.map(r => r[0]));
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 게시글 삭제
router.delete('/', async(req, res, next) => {
  try {
    await Post.destroy( {
      where : {
        id : req.params.id,
        userId: req.user.id,
      }
    })
  } catch ( error ) {
    console.error(error);
    next(error);
  }
})

// 해시태그 검색
router.get('/hashtag', async(req, res, next) => {
  const query = req.query.hashtag;
  if(!query) {
    return res.redirect('/');
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let post = []; 
    if (hashtag) {  
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    }
    return res.render('main', {
      title: `${query} | NodeBird`,
      user: req.user,
      twits: posts, 
    });

  } catch (error) {
    console.error(error)
    next(error);
  }
})

// 좋아요 버튼
router.post('/:id/like', async (req, res, next) => {
  try {
    // 게시물에 유저가 좋아요 할 수 있도록한다.
    const post = await Post.findOne({ where: {id: req.params.id}});
    await post.addLiker(req.user.id);
    res.send('OK');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 좋아요 취소 버튼
router.delete('/:id/like', async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: {id: req.params.id}});
    await post.addLiker(req.user.id);
    res.send('OK');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;