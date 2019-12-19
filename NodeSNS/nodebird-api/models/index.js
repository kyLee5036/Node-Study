const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(
  config.database, config.username, config.password, config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require('./user')(sequelize, Sequelize);
db.Post = require('./post')(sequelize, Sequelize);
db.Hashtag = require('./hashtag')(sequelize, Sequelize);
db.Domain = require('./domain')(sequelize, Sequelize);

db.User.hasMany(db.Post); // 사용자가 게시글을 많이 가지고 있다.
db.Post.belongsTo(db.User); // 게시글은 사용자에게 속해 있다.

db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });
db.Hashtag.belongsToMany(db.Post, { through: 'PostHashtag' });


db.User.belongsToMany(db.User, {
  through: 'Follow', 
  as: 'Followers', 
  foreignKey: 'followingId'
}); // 팔로워로 결정
db.User.belongsToMany(db.User, {
  through: 'Follow', 
  as: 'Followings', 
  foreignKey: 'followerId'
}); // 팔로잉으로 결정

db.User.belongsToMany(db.Post, {through: 'Like' });
db.Post.belongsToMany(db.User, {through: 'Like' ,as: 'Liker'});

db.User.hasMany(db.Domain);
db.Domain.belongsTo(db.User);

module.exports = db;
