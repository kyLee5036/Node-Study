# 스스로 해보기1

## (파일 복사 명령어 만들기)

### command.js

```javascript

const copyFile = (name, directory) => {
  if(exist(name)) {
    mkdirp(directory);
    fs.copyFileSync(name, path.join(directory, name));
    console.log(`${name} 파일이 복사되었습니다.` );
  } else {
    console.error('파일이 존재하지 않아요.')
  }
};

...생략
program
  .command('copy <name> <directory>') // <이름> <복사할 장소>
  .description('파일을 복사합니다')
  .action((name, directory) => {
    copyFile(name, directory);
    triggered = true;
  })

```

실행결과

<pre><code>Options:
  -v, --version                   output the version number
  -h, --help                      output usage information

Commands:
  template|tmpl [options] <type>  템플릿을 생성합니다.
  copy <name> <directory>         파일을 복사합니다</code></pre>

실행결과

<pre><code>D:\_Node_Study\node_cli\homework>copy package.json public/html
package.json 파일이 복사되었습니다.
</code></pre>

## (파일 지우기 만들기)

### command.js

```javascript
// 파일 지우기 메서드
const rimraf = (p) => {
  // 여기서 path가 폴더인지 파일인지를 구별해야한다.
  // 자세한 건 공식문서에 참고해야한다.
  if (exist(p)) {
    try {
      const dir = fs.readdirSync(p);
      dir.forEach((d) => {
        rimraf(path.join(p, d));
      });
      fs.rmdirSync(p);
      console.log(`${p} 폴더를 삭제했습니다.`)
    } catch (e) {
      fs.unlinkSync(p);
      console.log(`${p} 파일을 삭제했습니다.`)
    }
  } else {
    console.log('파일 또는 폴더가 존재하지 않아요')
  }
}

...
// 파일 지우기 파일
program
  .command('rimraf <path>')
  .usage('<path>')
  .description('지정한 경로와 그 아래 파일/폴더를 지웁니다.')
  .action( (path) => {
    rimraf(path);
    triggered = true;
})

```

<pre><code>D:\_Node_Study\node_cli\homework>cli rimraf public/html
public\html\index.html 파일을 삭제했습니다.
public/html 폴더를 삭제했습니다.</code></pre>
