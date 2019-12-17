// 좋아요 테이블

module.exports = ( (sequelize, DataTypes) => (
  sequelize.define ('like', {
      userid: {
          type: DataTypes.STRING(50),
          allowNull : false,
      },
      postid : {
          type : DataTypes.STRING(50),
          allowNull: false,
      }
  }, {
      timestamps: true,
      paranoid: true,
  })
));