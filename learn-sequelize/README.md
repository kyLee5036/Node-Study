설치순서
1. express 파일명 --view=pug (express를 설치한다)
2. cd 파일명 (파일명 안에 들어간다)
3. npm i (모듈을 설치한다)
4. npm i sequelize mysql2 (mysql2를 설치한다) 
-> mysql2@1.7.0
-> sequelize@5.19.4
5. npm i -g sequelize-cli 
(시퀄라이즈라는 명령어를 사용한다(글로벌을 사용할 것))
6. sequelize-init (파일과 폴더를 자동적으로 만들어 준다)

--> models/index.js 파일이 가장중요하다. (소스를 보면서 이해를 하길...)

1:1 hasOne, belongsTo
1대N hasMany, belongsTo
N대N belongsToMany

Promise에 지원해주는 메서드

create 생성하기
findAll 모두 찾기
find 하나만 찾기