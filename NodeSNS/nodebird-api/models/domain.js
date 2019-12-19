// 도메인 테이블
// 카카오 개발자 같은 것을 만들거라서 도메인 테이블을 만든다.
module.exports = (sequelize, DataTypes) => {
  sequelize.define('domain', {
    // API를 쓸수 있는 것
    host: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    // 유료 사용자, 무료 사용자 구분
    type: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    // 카카오에서 발급받은 비밀 키
    clientSecret: {
      type: DataTypes.STRING(40),
      allowNull: false,
    }
  }, {
    timestamps: true, // 생성일, 수정일
    paranoid: true, // 삭제일
    validate: { // 더 엄격하게 검증하는 거, 
      unknowType() { // 마음대로 이름정해도 상관없다.
        // free나 premium 중에 아니면 디비에 저장이 안된다!
        if ( this.type === 'free' && this.type !== 'premium') {
          throw new Error('type 컬럼은 free거나 premium이어야 한다.');
        }
      }
    },
  })
};

