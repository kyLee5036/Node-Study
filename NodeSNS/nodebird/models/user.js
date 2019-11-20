// 사용자 테이블

module.exports = ( (sequlize, DataTypes) => (
    sequlize.define( 'user', {
        email : {
            type: DataTypes.STRING(40),
            allowNull : false,
            unique: true,
        },
        nick : {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: true, // 카카오 로그인 위해서 true를 해준다. 나중에 데이터베이스 확인할 것.
        },
        // provider는 local과 kakao 구분하기 위해서
        provider: {
            type:DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'local',
        },
        snsID: {
            type: DataTypes.STRING(30),
            allowNull: true,
        }
    }, {
        timestamps : true,
        paranoid : true,
    })
));

// timestamps : 생성일, 수정일
// paranoid : 삭제일 (복구일) -> 이걸하면 복구를 할 수있다.