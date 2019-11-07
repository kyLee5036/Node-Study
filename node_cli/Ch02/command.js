#!/usr/bin/env node
const program = require('commander');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const htmlTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta chart="utf-8" />
  <title>Template</title>
</head>
<body>
  <h1>Hello</h1>
  <p>CLI</p>
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

const exist = (dir) => {
  try {
    fs.accessSync(dir, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch (e) {
    return false;
  }
};

const mkdirp = (dir) => {
  const dirname = path
    .relative('.', path.normalize(dir))
    .split(path.sep)
    .filter(p => !!p);
  dirname.forEach((d, idx) => {
    const pathBuilder = dirname.slice(0, idx + 1).join(path.sep);
    if (!exist(pathBuilder)) {
      fs.mkdirSync(pathBuilder);
    }
  });
};

const makeTemplate = (type, name, directory) => {
  mkdirp(directory);
  if (type === 'html') {
    const pathToFile = path.join(directory, `${name}.html`);
    if (exist(pathToFile)) {
      console.error(chalk.bold.red('이미 해당 파일이 존재합니다'));
    } else {
      fs.writeFileSync(pathToFile, htmlTemplate);
      console.log(chalk.green(pathToFile, '생성 완료'));
    }
  } else if (type === 'express-router') {
    const pathToFile = path.join(directory, `${name}.js`);
    if (exist(pathToFile)) {
      console.error(chalk.bold.red('이미 해당 파일이 존재합니다'));
    } else {
      fs.writeFileSync(pathToFile, routerTemplate);
      console.log(chalk.green(pathToFile, '생성 완료'));
    }
  } else {
    console.error(chalk.bold.red('html 또는 express-router 둘 중 하나를 입력하세요.'));
  }
};



program
    .version('0.0.1', '-v, --version') // 버전관리
    .usage('[options]'); // 프로그램 설명서

program
    .command('template <type>') // 명령어를 설정
    .usage('--name <name> --path [path]') // [] : 옵션, <> : 필수
    .description('템플릿을 생성합니다.') // 말로된 설명
    .alias('tmpl') // 별명
    .option('-n, --name <name>', '파일명을 입력하세요.', 'index') // --옵션 (<필수>) - 단축옵션 : ([선택])
    .option('-d, --directory [path]', '생성 경로를 입력하세요', '.')
    .action((type, options) => {
        // 진짜 템플릿 만들어 주기위한 조건
        makeTemplate(type, options.name, options.directory);
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
    

