# Node CLI 프로그램 만들기

#### index.js (철자 틀리지 말것!!!)
```javascript 
#!/usr/bin/env node
```
의미 : 
+ widow에서 단순한 주석
+ 리눅스, 맥에서는 노드프로그램이 이 경로에 설치되어잇다.  즉, 경로라는 말이다. 
+ 경로프로그램에서 이 프로그램을 실행하는 의미이다.

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

+ TIP) 패키지명과 명령어명이 꼭 같을 필요가 없다.

precess.argv: 사용자가 입력한 내용을 배열로 출력한다<br>
precess.argv[0] : 노드 설치 경로<br>
precess.argv[1] : 파일 위치 경로<br>
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
const readline = require('readline');

// createInterface : 사용자와 컴퓨터가 소통하는 창구(interface)를 만든다(create).
const rl = readline.createInterface({
    // 입력
    input: process.stdin,
    // 결과출력
    output: process.stdout,
});

// question은 사용자와 상호작용이 가능하다
rl.question('예제 재미있습니까? (y/n)', (answer) => {
    if(answer === 'y') {
        console.log('감사합니다');
    } else if(answer === 'n') {
        console.log('죄송합니다');
    } else {
        console.log('y 또는 n만 입력하세요');
    }
    // 사용하면 다 하면 인터페이스 닫아준다.
    rl.close();
});
```


