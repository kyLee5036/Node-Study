const express = require('express');
const multer = require('multer');
const path = require('path');

const {Post, Hashtag} = require('../models');

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

router.get('/img', upload.single('img'), (req, res) => {
  console.log(req.file);
  res.json({
    url: `/img/${req.file.filename}`
  });
});

const upload2 = multer();
// 사진 업로드 후 게시글 업로드 시에는 사진 대신 사진 주소를 올리므로 none을 쓴다
// 사진 안 올리는 경우에는 none()을 써준다 . 
router.post('/', upload2.none(), async (req, res, next) => {
  // 게시글 업로드 처리
  try {
    // 게시글 생성
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url, //
      userId: req.user.id, // userID는 게시글 작성하면 게시글 작성자이다.
    });
    // 해시태그은 정규표현식으로 추출한다. 해시태그를 가져오는 정규표현식
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      // 해시태그들을 해시태그 테이블에 넣어준다.
      // 안녕하세요 #노드 #익스프레스
      // hashtages = ['#노드', '#익스프레스'] 
      // 해시태그 테이블에 추가해주기위해서, map과 Promise.all를 사용해서 값들을 넣어준다.
      const result = await Promise.all(hashtags.map(tag => Hashtag.findOrCreate({
        // findeOrCreate : DB에 있으면 찾고 없으면 새로 생성
        // 중복된 것은 어떻게 되냐? 중복되는 거 있으면 하나만 찾고, 중복되지 않은 것은 테이블에 데이터를 추가한다.
        where: {
          title: tag.slice(1).toLowerCase()
        },
        // slice(1) : '#'표시들은 제거
        // 대소문자 구별-> 소문자로 바꿔준다(검색을 할 때)
      })));

      // 해시태그들을 연결해주는 것이다.
      // 해새태그 아이디을 넣어주면 자동으로 다대다 관계로 맺어준다.
      // 관계설정
      // 추가한 내용을 관계설정
      await post.addHashtags(result.map(r => r[0]));

      // A.getB : 관계있는 로우 조회
      // A.addB : 관계 생성
      // A.setB : 관계 수정
      // A.removeB : 관계 제거
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
});
module.exports = router;