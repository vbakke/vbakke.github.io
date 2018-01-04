module.exports = require("./src/trytes.js");

let Trytes = module.exports;
let trytes = Trytes.encodeTextAsTryteString('\u00ff');
trytes = Trytes.encodeTextAsTryteString('Säφę');
console.log(Trytes.decodeTextFromTryteString(trytes));
trytes = Trytes.encodeTextAsTryteString('雪หิ🌲☃');
console.log(Trytes.decodeTextFromTryteString(trytes));
/*

//let bytes = Trytes.encodeTryteStringAsBytes('99ZZ');
//let trytes = Trytes.decodeTryteStringFromBytes([0, 240, 8, 244]);



let text = 'øl';
function test(text, encoding) {
    console.log('Original text: ', text, '   encoding:',encoding);

    console.log('Encoded tryte: ', trytes);

    let reverted = Trytes.decodeTextFromTryteString(trytes);
    console.log('Decoded text:  ', reverted);

    //let tu8 = Trytes.encodeTextAsTryteString(text, 'utf8');
    //let tu16 = Trytes.encodeTextAsTryteString(text);
    //console.log(tu8.length, tu16.length, text,  tu8, tu16)
}
test('ol');
/*
test('øl', 'latin1');
test('øl', 'utf8');
test('øl', 'utf16le');


test('øle');
test('ølę');
test('\u2603\u{1F332}\u96EA');
// * /
test('\u{1F332}\u0E10\u0E10\u0E10\u0E10');
test('\u{1F332}A\u0E10\u0E10\u0E10\u0E10');
test('\u{1F332}AA\u0E10\u0E10\u0E10\u0E10');
test('\u{1F332}AAA\u0E10\u0E10\u0E10\u0E10');
test('\u{1F332}AAAA\u0E10\u0E10\u0E10\u0E10');
test('\u{1F332}AAAAA\u0E10\u0E10\u0E10\u0E10');
test('\u{1F332}AAAAAA\u0E10\u0E10\u0E10\u0E10');
test('\u{1F332}AAAAAAA\u0E10\u0E10\u0E10\u0E10');
test('\u{1F332}AAAAAAAA\u0E10\u0E10\u0E10\u0E10');

/*
test('\u{1F332}\u{1F332}\u{1F332}\u{1F332}');
test('\u{1F332}\u{1F332}\u{1F332}\u{1F332}', 'utf16le');


// */