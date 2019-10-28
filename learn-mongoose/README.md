# 몽고디비(NoSQL) : 기본경로 (27017)

<pre><code>몽구디비 실행
1. 명렁어 실행창 켜기 (cmd) 
2. 몽구디비 경로 : C:\Program Files\MongoDB\Server\3.6\bin
3. 명령어 창에 입력 : mongod
4. 연결완료되면 연결이 된다.</code></pre>

- 자유로운 데이터들이 들어올 때 사용한다.
- 관계가 없다 (1대1, 1대N N대N)
- 속성 안에 객체를 넣을 수도 있다.
- 고정된 길이의 배열이면 속성 안에 넣고, 계속 늘어날 것 같다면 컬렉션을 별도로 둔다.
(예로들면, 인터넷, 쇼핑등 데이터 수집할 때, 빅데이터에 많이 사용)
- 컬럼이 없는 NOSQL이다.
- 자유로운 점은 좋지만, 통제를 할 수 없다.<br>
=> 여기서 몽구스는 몽고디비에 제약을 두지만 편의성과 안정성을 추가한다.<br> (몽구스랑 몽고디비랑 다르다!!!)

<br>

<strong>시퀄라이즈 ORM</strong><br> 
<strong>몽구스 ODM</strong>

<br>
설치경로, 설정은 인터넷검색으로 할 수 있다.<br>
몽고디비 경로 : C:\Program Files\MongoDB\Server\3.6\bin<br>
몽고디비 데이터 경로 : C:\data\db (내가 지정하였음)<br>
몽고디비 연결할려면 : 
C:\Program Files\MongoDB\Server\3.6\bin 에 들어가서 mongod를 입력한다.<br>
비밀번호 설정 및 참고 https://www.zerocho.com/category/MongoDB/post/5b10cfa685f72d001bebe020

<br>
MySQL : 스키마 - 테이블 - 로우<br>
MongoDB : 디비 - 컬렉션 - 다큐먼트 
<br>

<pre><code>npm i -g express-generator // express 전역변수 설정
express 폴더명 --view=pug // 폴더 생성하는 명령어, view는 pug
</code></pre>
그러면 폴더가 생성된다.
<pre><code>npm i mongoose
+ mongoose@5.7.7 // 몽구스 설치 완료 
</code></pre>

schemas폴더는 따로 생성해준다.<br>
public -> mongoose.js는 퍼옴<br>
views -> monngoose.pug는 퍼옴<br>

## schemas/index.js

```javascript
// 몽구스파일 불러오기
const mongoose = require('mongoose');

module.exports= () => {
    // 연결을 재사용하니까 함수로 만들어주었다.
    const connect = () => {
        // 실제 하드코딩하면 위험하다. 나중에는 변수에서 빼준다.
        // 몽구스 연결
        mongoose.connect('mongodb://DB_ID:DB_PASSWORD@localhost:27017/admin', {
            dbName: 'nodejs' , // DB명
        }, (error) => {
            if (error) {
                console.log('MongoDB Error', error);
            } else {
                console.log('MongoDB connect success!!')
            }
        });
    };
    connect();
    mongoose.connection.on('error', (error) => {
        console.log('MongoDB connect error', error);
    });
    mongoose.connection.on('disconnected', (error) => {
        console.log('MongoDB disconnect(연결이 끊김) restart(재시도)');
        connect();
    });
    // user, comment를 불러온다.
    require('./user');
    require('./comment');
}
```

### routes/index
```javascript
var express = require('express');
var User = require('../schemas/user');

var router = express.Router();

router.get('/', function (req, res, next) {
    // find 정보를 모두가져온다.
  User.find({})
    .then((users) => {
      res.render('mongoose', { users });
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

module.exports = router;
}
```

find: 모두찾기<br>
findOne: 하나만찾기<br>
new 스키마(data).save: 생성<br>
update: 수정하기<br>
remove: 제거하기<br>

## - Mogoose populate

populate(필드)가 시퀄라이즈 include와 비슷한 역할을 한다.<br>
조인과 가능기능 (populate)

### routes/comment.js

```javascript
router.get('/:id', function (req, res, next) {
    // pupulate('commenter) -> 오브젝트 ID가 사용자에 대한 객체로 변환다. (몽구스의 장점) --> populate -> 스키마를 조사를한다 
    // 몽구스의 기능 : populate는 조인과 같은기능!!! 
  Comment.find({ commenter: req.params.id }).populate('commenter')
    .then((comments) => {
      console.log(comments);
      res.json(comments);
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

```
밑에 자세히 보면 ref가 있다. 

### schema/comment.js

```javascript
const commentSchema = new Schema({
    // ref가 user의 기본 키를 참조를 한다.
    // NoSQL이니까 관계는 없다. 
    commenter: {
        type: ObjectId,
        required: true,
        ref: 'User',
    },
      comment: {
        type: String,
        required: true,
    },
      createdAt: {
        type: Date,
        default: Date.now,
    },
});

```



