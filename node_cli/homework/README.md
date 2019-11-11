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



