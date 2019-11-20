// 게시물 테이블

module.exports = ( (sequelize, DataTypes) => (
    sequelize.define ('post', {
        content: {
            type: DataTypes.STRING(140),
            allowNull : false,
        },
        img : {
            // img주소를 저장하기 위해서 STRING을 해줬다.
            type : DataTypes.STRING(200),
            allowNull: true,
        }
    }, {
        timestamps: true,
        paranoid: true,
    })
));