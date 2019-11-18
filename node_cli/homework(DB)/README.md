# 스스로 해보기

## DB와 연동해서 가계부

DB연동하기위해서 npm 설치를 해준다. <br>
<pre><code>D:\_Node_Study\node_cli\homework(DB)>npm i sequelize mysql2
npm WARN homework2@0.0.1 No repository field.

+ mysql2@2.0.0
+ sequelize@5.21.2</code></pre>

<strong>전역 설치를 해준다.</strong>
<pre><code>D:\_Node_Study\node_cli\homework(DB)>npm i -g sequelize-cli

+ sequelize-cli@5.5.1
added 2 packages from 1 contributor and updated 8 packages in 8.456s
</code></pre>
<pre><code>D:\_Node_Study\node_cli\homework(DB)>sequelize init

Sequelize CLI [Node: 10.16.0, CLI: 5.5.1, ORM: 5.21.2]

Created "config\config.json"
Successfully created models folder at "D:\_Node_Study\node_cli\homework(DB)\models".
Successfully created migrations folder at "D:\_Node_Study\node_cli\homework(DB)\migrations".
Successfully created seeders folder at "D:\_Node_Study\node_cli\homework(DB)\seeders".
</code></pre>

폴더를 보면 config, migrations, models, seeders를 자동적으로 만들어준다.

#### config/config.json

```javascript
"development": {
    "username": "root",
    "password": "패스워드",
    "database": "데이터베이스명",
    "host": "127.0.0.1",
    "port": "포트바뀌면 써주세요",
    "dialect": "mysql",
    "operatorsAliases": false,
    "logging" : false
  },
```

#### models/index.js
```javascript
db.Wallet = require('./wallet')(sequelize, Sequelize);
```
DB에 연동할 지갑테이블명 적어준다.

전역설치 npm i -g를 해주고나서, wlt 명령어를 써줘야한다.
```javascript
"bin": {
    "wlt": "./wallet.js"
},
```

#### wallet.js
```javascript
#!/usr/bin/env node

const program = require('commander');
const inquirer = require('inquirer');

const { version} = require('./package');
// 모델에서 시퀄라이즈, Wallet 테이블명을 불러온다
const { sequelize, Wallet} = require('./models');

program
    .version(version, '-v, --version')
    .usage('[options]');

//수입
program
    .command('revenue <money> <desc>')
    .description('수입을 기록합니다.')
    .action( async (money, desc) => {
        // 디비연결
        await sequelize.sync();
        await Wallet.create({
            money: parseInt(money, 10),
            desc,
            type: true,
        });
        console.log(`${money}원을 얻었습니다.`);
        // close -> 디비종료
        await sequelize.close();
    });
//지출
program
    .command('expense <money> <desc>')
    .description('지출을 기록합니다.')
    .action( async () => {
         // 디비연결
        await sequelize.sync();
        await Wallet.create({
            money: parseInt(money, 10),
            desc,
            type: false,
        });
        console.log(`${money}원을 썻습니다.`);
         // close -> 디비종료
        await sequelize.close();
    });

//잔액
program
    .command('balance')
    .description('잔액을 표시합니다.')
    .action( async () => {
         // 디비연결
        await sequelize.sync();
        const logs = await Wallet.findAll({});
        // const revenue = logs.filter( l => l.type === true).reduce( (acc, cur) => acc + cur.money, 0);
        const revenue = logs
            .filter( l=> l.type === true)
            .reduce((acc, cur) => acc + cur.money, 0);
        
        const expense = logs
            .filter( l=> l.type === false)
            .reduce((acc, cur) => acc + cur.money, 0);
        console.log(`${revenue - expense}원 남았습니다.`);
        console.log(test);
        await sequelize.close();
    });

// 오류처리
program
    .command('*')
    .action( () => {
        console.log('알 수 없는 명령어입니다.')
    })


program.parse(process.argv);
```


#### wallet.js
triggered를 해주었을 때 ( 다른 쪽에도 설정해줘야 한다.)
```javascript

if (!triggered) {
    inquirer.prompt([{
      type : 'list',
      name: 'type',
      message: '보고자 하는 종류를 선택하세요.',
      choices: ['수입', '지출', '잔액'],
    }, {
      type : 'input',
      name: 'money',
      message: '금액을 입력하세요.',
      default: '0',
    }, {
      type : 'input',
      name: 'desc',
      message: '설명을 입력하세요.',
      choices: '.',
    }, {
      type : 'confirm',
      name: 'confirm',
      message: '생성하시겠습니까?',
    }])
      .then( async (answer) => {
        if(!answer.confirm) {
            if (answer.type = '수입') {
             
                // 디비연결
                await sequelize.sync();
                await Wallet.create({
                    money: parseInt(money, 10),
                    desc: answer.desc,
                    type: true,
                });
                console.log(`${answer.money}원을 얻었습니다.`);
                // close -> 디비종료
                await sequelize.close();
                triggered = true;
                
            }else if (answer.type = '지출') {
                 // 디비연결
               await sequelize.sync();
               await Wallet.create({
                   money: parseInt(money, 10),
                   desc: answer.desc,
                   type: false,
               });
               console.log(`${answer.money}원을 썻습니다.`);
               // close -> 디비종료
               await sequelize.close();
               triggered = true;
            }else {
                await sequelize.sync();
                const logs = await Wallet.findAll({});
                // const revenue = logs.filter( l => l.type === true).reduce( (acc, cur) => acc + cur.money, 0);
                const revenue = logs
                    .filter( l=> l.type === true)
                    .reduce((acc, cur) => acc + cur.money, 0);
                
                const expense = logs
                    .filter( l=> l.type === false)
                    .reduce((acc, cur) => acc + cur.money, 0);
                console.log(`${revenue - expense}원 남았습니다.`);
                console.log(test);
                await sequelize.close();
                triggered = true;
            }
        }
      })
  }

```