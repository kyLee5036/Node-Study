# Node CLI 프로그램 만들기

프레임워크를 사용해서 하기.<br>
commander : Commander라는 프레임워크<br>
<strong>inquirer</strong> : 대화형 (소통을 할 수 있게 해준다)<br>
<strong>chalk</strong> : 콘솔에 컬러를 해주는 것 ( 콘솔 디자인 )<br>

package.json가 바뀌면 전역설치 다시 해준다.<br>
<strong>npm i -g</strong>

### commander 사용하기

<pre><code>npm i commander inquirer chalk
+ inquirer@7.0.0
+ chalk@2.4.2
+ commander@4.0.0
</code></pre>

#### command.js

```javascript
#!/usr/bin/env node
const program = require('commander');
// commander 장점이 설명서를 자동으로 생성해준다.


program
    .version('0.0.1', '-v, --version') // 버전관리
    .usage('[options]'); // 프로그램 설명서

program
    .command('template <type>') // 명령어를 설정
    .usage('--name <name> --path [path]') // [] : 옵션, <> : 필수
    .description('템플릿을 생성합니다.') // 말로된 설명
    .alias('tmpl') // 별명
    .option('-n, --name <name>', '파일명을 입력하세요', 'index') // --옵션 (<필수>) - 단축옵션 : ([선택])
    .option('-d, --directory [path]', '생생 경로를 입력하세요.', '.')
    .action((type, options) => {
        console.log(type, options.name, options.directory);
    });

program
    .command('*', { // 모든 경우
        // noHelp가 true면 도움말에 해당 명령어 설명이 뜨지 않는다.
        noHelp : true
    }) 
    .action(() => {
        console.log('해당 명령어를 찾을 수 없습니다.');
        program.help();
    }); 

// 프로그램 실행부
program
    .parse(process.argv);
```


<pre><code>D:\_Node_Study\node_cli\Ch02>cli -v
0.0.1
</code></pre>

<pre><code>D:\_Node_Study\node_cli\Ch02>cli --version
0.0.1
</code></pre>

<pre><code>D:\_Node_Study\node_cli\Ch02>cli -h
Usage: command [options]

Options:
  -v, --version                   output the version number
  -h, --help                      output usage information

Commands:
  template|tmpl [options] <type>  템플릿을 생성합니다.
</code></pre>

<pre><code>D:\_Node_Study\node_cli\Ch02>cli template -help
Usage: command template|tmpl --name <name> --path [path]

템플릿을 생성합니다.

Options:
  -n, --name <name>       파일명을 입력하세요 (default: "index")        
  -d, --directory [path]  생생 경로를 입력하세요. (default: ".")      
  -h, --help              output usage information

D:\_Node_Study\node_cli\Ch02>

타입을 적어줘야한다.
</code></pre>D:\_Node_Study\node_cli\Ch02>cli template
error: missing required argument 'type'

<pre><code>D:\_Node_Study\node_cli\Ch02>cli template html --name hello
html hello .
</code></pre>

#### tmeplate.js (추가내용이 있음)
```javascript
#!/usr/bin/env node
const program = require('commander');

const fs = require('fs');
const path = require('path');
const readline = require('readline');

let rl;
let type = process.argv[2];
let name = process.argv[3];
let directory = process.argv[4] || '.';

const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
</head>
<body>
    <h1>CLI Hello</h1>
</body>
</html>`;

const routerTemplate = `const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    try {
      res.send('ok');
    } catch (error) {
      console.error(error);
      next(error);
    }
 });

 module.exports = router;`;

const mkdirp = (dir) => {
    const dirname = path
        .relative('.', path.normalize(dir))
        .split(path.sep)
        .filter(p => !!p);
    dirname.forEach((element, index) => {
        const pathBulider = dirname.slice(0, index + 1).join(path.sep);
        if (!exist(pathBulider)) {
            fs.mkdirSync(pathBulider)
        }

    });
};

const exist = (dir) => {
    try {
        fs.accessSync(dir, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
        return true;
    } catch (e) {
        return false;
    }
};

const makeTemplate = () => {
    mkdirp(directory);
    if (type === 'html') {
        const pathToFile = path.join(directory, `${name}.html`);
        if (exist(pathToFile)) {
            console.error('이미 해당 파일이 존재합니다');
        } else {
            fs.writeFileSync(pathToFile, htmlTemplate);
            console.log(pathToFile, '생성 완료');
        }
    } else if (type === 'express-router') {
        const pathToFile = path.join(directory, `${name}.js`);
        if (exist(pathToFile)) {
            console.error('이미 해당 파일이 존재합니다');
        } else {
            fs.writeFileSync(pathToFile, routerTemplate);
            console.log(pathToFile, '생성 완료');
        }
    } else {
        console.error('html 또는 express-router 둘 중 하나를 입력하세요.');
    }
};



program
    .version('0.0.1', '-v, --version') // 버전관리
    .usage('[options]'); // 프로그램 설명서

program
    .command('template <type>') // 명령어를 설정
    ......생략

```

<pre><code>D:\_Node_Study\node_cli\Ch02>cli template html -d public/html -n new
public\html\new.html 생성 완료
</code></pre>

<pre><code>
</code></pre>

<pre><code>
</code></pre>

<pre><code>
</code></pre> 

<pre><code>
</code></pre>
