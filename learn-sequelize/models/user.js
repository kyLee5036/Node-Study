/*
 
type : 자료형
allowNull : NULL이어도 돼?
defaultValue : 기본값
unique : 고유값 여부
comment : 컬럼 설명
primaryKey : 기본키 여부 (id 대체)

자료형 : STRING(글자수), INTEGER, FLOAT, TEXT, DATE, BOOLEAN 등등
 
 
 */
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('user', {
        name: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        age: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        married: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('now()'),
        },
    }, {
        timestamps: false,
    });
};

// user 테이블
// 이름, 나이, 결혼여부,  자기소개,   생성일
// LEE   23     false   안녕하세요   2019-10-11
// park  32     true    난 군인      2019-10-12