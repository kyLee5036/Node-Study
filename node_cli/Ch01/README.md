# Node CLI 프로그램 만들기

#### index.js (철자 틀리지 말것!!!)

```javascript
#!/usr/bin/env node
```

의미 :

- widow에서 단순한 주석
- 리눅스, 맥에서는 노드프로그램이 이 경로에 설치되어잇다. 즉, 경로라는 말이다.
- 경로프로그램에서 이 프로그램을 실행하는 의미이다.

#### pachage.json

```javascript
{
  "name": "node_cli",
  "version": "0.0.1",
  "description": "node CLI program",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "LEEKY",
  "license": "ISC",
  "bin": {
    "cli": "./index.js"
  }
}
```

이거 cli 되지 않는 경우에는 cli를 다른거 바꾸고 실행해보기

```javascript
"bin": {
    "bin": "./index.js"
}
```

또는<br>
powershell에 실행하지 않고, <strong>cmd에 실행해보기</strong>!!!!!

cli명령어를 할수있다. cli 명령어 하기전에 npm i -g 해야한다. <br>
전역설치하는 순간 cli프로그램이 된다. <br>
실행할려면 <strong>cli</strong> 치면 된다.<br>

TIP) 패키지명과 명령어명이 꼭 같을 필요가 없다.

- precess.argv: 사용자가 입력한 내용을 배열로 출력한다<br>
- precess.argv[0] : 노드 설치 경로<br>
- precess.argv[1] : 파일 위치 경로<br>
  <pre><code>precess.argv
  precess.argv[0]
  precess.argv[1]
  </code></pre>
  <pre><code>[ 'C:\\Program Files\\nodejs\\node.exe',
    'C:\\Users\\LEE KY\\AppData\\Roaming\\npm\\node_modules\\node_cli\\index.js' ]
  C:\Program Files\nodejs\node.exe
  C:\Users\LEE KY\AppData\Roaming\npm\node_modules\node_cli\index.js
  </code></pre>

#### index.js

```javascript
#!/usr/bin/env node
const readline = require("readline");

// createInterface : 사용자와 컴퓨터가 소통하는 창구(interface)를 만든다(create).
const rl = readline.createInterface({
  // 입력
  input: process.stdin,
  // 결과출력
  output: process.stdout
});

// question은 사용자와 상호작용이 가능하다
rl.question("예제 재미있습니까? (y/n)", answer => {
  if (answer === "y") {
    console.log("감사합니다");
  } else if (answer === "n") {
    console.log("죄송합니다");
  } else {
    console.log("y 또는 n만 입력하세요");
  }
  // 사용하면 다 하면 인터페이스 닫아준다.
  rl.close();
});
```

---

#### template.js

```javascript
#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// 타입
const type = process.argv[2];
// 파일명
const name = process.argv[3];
// 디렉터리 (파일경로), '.'는 현재경로
const directory = process.argv[4] || ".";

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

// 잊어버렸으면 path 강좌보기
const mkdirp = dir => {
  // 절대경로 -> C:\folder/html/index.html
  // 상대경로 -> ./folder/html/index.html
  // sep는 `/` 의미한다.

  // 상대경로 알려주는 메서드
  const dirname = path
    .relative(".", path.normalize(dir))
    .split(path.sep)
    .filter(p => !!p);
  dirname.forEach((element, index) => {
    // [css. ,js, html] 파일들이 있다고하면
    // css 존재 하지않으면 css 만들고, js 존재 하지않으면 js 만들고... 순서대로 간다.
    const pathBulider = dirname.slice(0, index + 1).join(path.sep);
    if (!exist(pathBulider)) {
      fs.mkdirSync(pathBulider);
    }
  });
};

const exist = dir => {
  try {
    // fs.constants.F_OK : 파일존재, fs.constants.R_OK : 읽기가능여부,
    // fs.constants.W_OK: 쓰기가능여부
    fs.accessSync(
      dir,
      fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK
    );
    return true;
  } catch (e) {
    return false;
  }
};

const makeTemplate = () => {
  // 폴더 경로를 먼저 만들어준다.
  mkdirp(directory);
  // html 만드는 코드
  if (type === "html") {
    // directory(파일경로) + 파일명
    const pathToFile = path.join(directory, `${name}.html`);
    // 파일 존재 검사 여부
    if (exist(pathToFile)) {
      console.error("이미 해당 파일이 존재합니다");
    } else {
      // 한 번만 실행되는 경우에는 Sync 써도 된다.
      // 여러 번 동시에 호출 될 것 같으면 쓰면 안된다.
      fs.writeFileSync(pathToFile, htmlTemplate);
      console.log(pathToFile, "생성 완료");
    }
  }
  // router 만드는 코드
  else if (type === "express-router") {
    const pathToFile = path.join(directory, `${name}.js`);
    if (exist(pathToFile)) {
      console.error("이미 해당 파일이 존재합니다");
    } else {
      fs.writeFileSync(pathToFile, routerTemplate);
      console.log(pathToFile, "생성 완료");
    }
  } else {
    console.error("html 또는 express-router 둘 중 하나를 입력하세요.");
  }
};

// 프로그램이라는 함수를 만든다
const program = () => {
  // 핵심적인 코드
  // 타입이랑 이름을 입력하지 않으면
  if (!type || !name) {
    console.error(`사용방법: cli html|express-router 파일명 [생성 경로]`);
  } else {
    makeTemplate();
  }
};
program();
```

#### package.json

```javascript
"bin": {
    "cli": "./template.js"
}
```

index.js에서 template.js으로 바꿔준다.
<br>그리고
npm i -g 다시 실행한다

### 실행결과

<pre><code>D:\_Node_Study\node_cli>cli
사용방법: cli html|express-router 파일명 [생성 경로]
</code></pre>
<pre><code>D:\_Node_Study\node_cli>cli html main public/html
public\html\main.html 생성 완료
</code></pre>

<pre><code>D:\_Node_Study\node_cli>cli express-router index ./routes
routes\index.js 생성 완료
</code></pre>
<pre><code>D:\_Node_Study\node_cli>cli express-router index ./routes
이미 해당 파일이 존재합니다
</code></pre>

프로그램이 알아서 만들어준다.

---

### CLI 상호작용 추가하기

사용자들에게 편의를 제공하는 프로그램을 만들어보자!

```javascript
// 대화형 프로그램만들기 위해서 추가
const readline = require("readline");

// const를 let으로 바꾸어준다. (자주 사용하기 때문에)
let rl;
// 타입
let type = process.argv[2];
// 파일명
let name = process.argv[3];
// 디렉터리 (파일경로), '.'는 현재경로
let directory = process.argv[4] || ".";

// 디렉토리
const dirAnswer = answer => {
  directory = (answer && answer.trim()) || ",";
  rl.close();
  makeTemplate();
};

const nameAnswer = answer => {
  if (!answer || !answer.trim()) {
    console.clear();
    console.log("name을 반드시 입력하셔야 합니다.");
    return rl.question("파일명을 설정하세요. ", nameAnswer);
  }
  name = answer;
  return rl.question(
    "저장할 경로를 설정하세요.(설정하지 않으면 현재경로) ",
    dirAnswer
  );
};

const typeAnswer = answer => {
  if (answer !== "html" && answer !== "express-router") {
    console.clear();
    console.log("html 또는 express-router만 지원합니다.");
    return rl.question("어떤 템플릿이 필요하십니까?", typeAnswer);
  }
  type = answer;
  return rl.question("파일명을 설정하세요. ", nameAnswer);
};

const program = () => {
  if (!type || !name) {
    // 대화형 인터페이스를 만든다
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    console.clear();
    rl.question("어떤 템플릿이 필요하십니까? (html 또는 express)", typeAnswer);
  } else {
    makeTemplate();
  }
};

program();
```

#### template.js (전체소스)

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 대화형 프로그램만들기 위해서 추가
const readline = require('readline');

let rl;
// 타입
let type = process.argv[2];
// 파일명
let name = process.argv[3];
// 디렉터리 (파일경로), '.'는 현재경로
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

// 디렉토리 
const dirAnswer = (answer) => {
    directory = ( answer && answer.trim() || ',');
    rl.close();
    makeTemplate();
}


const nameAnswer = (answer) => {
    if (!answer || !answer.trim()) {
      console.clear();
      console.log('name을 반드시 입력하셔야 합니다.');
      return rl.question('파일명을 설정하세요. ', nameAnswer);
    }
    name = answer;
    return rl.question('저장할 경로를 설정하세요.(설정하지 않으면 현재경로) ', dirAnswer);
  };

const typeAnswer = (answer) => {
    if (answer !== 'html' && answer !== 'express-router') {
        console.clear();
        console.log('html 또는 express-router만 지원합니다.');
        return rl.question('어떤 템플릿이 필요하십니까?', typeAnswer);
    }
    type = answer;
    return rl.question('파일명을 설정하세요. ', nameAnswer);
}

const program = () => {
    if (!type || !name) {
        // 대화형 인터페이스를 만든다
      rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      console.clear();
      rl.question('어떤 템플릿이 필요하십니까? (html 또는 express)', typeAnswer);
    } else {
      makeTemplate();
    }
  };
  
  program();
```
