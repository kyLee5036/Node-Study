// 경로, 시퀄라이즈를 불러온다.
const path = require('path');
const Sequelize = require('sequelize');

// 환경변수 (개발설정 : development, 실제 서비스 : production)
const env = process.env.NODE_ENV || 'development';
// 시퀄라이즈 설정파일 : config/config.json [env]:객체를 불러온다
const config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
// db 객체를 생성
const db = {};
// 시퀄라이즈의 데이터베이스, 아이디, 비밀번호 불러와서 "객체화"시킨다( 이건 그냥 외워야한다)
const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 패키지(파일)를 불러오고 모듈을 넣어준다.
db.User = require('./user')(sequelize, Sequelize);
db.Comment = require('./comment')(sequelize, Sequelize);


db.User.hasMany(db.Comment, {foreignKey : 'commenter'});
db.Comment.belongsTo(db.User);

module.exports = db;

