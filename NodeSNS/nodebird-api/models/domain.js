// 도메인 테이블
module.exports = (sequelize, DataTypes) => (
  sequelize.define('domain', {
    host: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    clientSecret: {
      type: DataTypes.STRING(40),
      allowNull: false,
    }
  }, {
    timestamps: true, 
    paranoid: true, 
    validate: {  
      unknowType() { 
        if ( this.type === 'free' && this.type !== 'premium') {
          throw new Error('type 컬럼은 free거나 premium이어야 한다.');
        }
      }
    },
  })
);

