const mongoose = require('mongoose');

module.exports= () => {
    const connect = () => {
        // 실제 하드코딩하면 위험하다. 나중에는 변수에서 빼준다.
        mongoose.connect('mongodb://root:dpttjt147@localhost:27017/admin', {
            dbName: 'nodejs' ,
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