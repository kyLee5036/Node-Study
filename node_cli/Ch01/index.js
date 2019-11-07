#!/usr/bin/env node
const readline = require('readline');


// createInterface : 사용자와 컴퓨터가 소통하는 창구를 만든다.
const rl = readline.createInterface({
    // 입력
    input: process.stdin,
    // 결과출력
    output: process.stdout,
});

console.clear();

// 콜백함수
const answerCallback = (answer) => {
    if(answer === 'y') {
        console.log('감사합니다');
        rl.close();
    } else if(answer === 'n') {
        console.log('죄송합니다');
        rl.close();
    } else {
        console.clear();
        console.log('y 또는 n만 입력하세요');
        // question은 사용자와 상호작용이 가능하다
        rl.question('예제 재미있습니까? (y/n)', answerCallback);
    }
    // 사용하면 다 하면 인터페이스 닫아준다.
};
rl.question('예제 재미있습니까? (y/n)', answerCallback);