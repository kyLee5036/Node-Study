
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('comment', {
      comment: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('now()'),
      },
    }, {
      timestamps: false, // 생성일 있으니까 false해준다
    });
  };

// Comment 테이블
// 작성자, 댓글,     생성일
// LEE      gg     2019-10-11
// park     zz      2019-10-12

