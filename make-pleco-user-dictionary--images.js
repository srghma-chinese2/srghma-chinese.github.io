#!/usr/bin/env node
'use strict';

const path = require('path')
const https = require('https')
const http = require('http')
const fs = require('fs')
const R = require('ramda')
const removeHTML = require('/home/srghma/projects/anki-cards-from-pdf/scripts/lib/removeHTML').removeHTML
const {
  r12345_chars,
  r12345_showChar__src,
} = require('./myscript-common')

const {
  mkStardict,
} = require('./make-pleco-user-dictionary--utils.js')

// const downloadFolder = './srghma-chinese-r12345-images';

// if (!fs.existsSync(downloadFolder)){
//   fs.mkdirSync(downloadFolder);
// }

// const download = (url, dest) => {
//   return new Promise((resolve, reject) => {
//     const file = fs.createWriteStream(dest);
//     http.get(url, response => {
//       response.pipe(file);
//       file.on('finish', () => {
//         file.close(() => {
//           resolve();
//         });
//       });
//     }).on('error', error => {
//       fs.unlink(dest, () => {
//         reject(error);
//       });
//     });
//   });
// };

// ;(async function () {
//   async function downloadChunk(urls) {
//     const promises = urls.map(async (hanzi) => {
//       const id = encodeURIComponent(hanzi).replace(/%/g,'')
//       const src = 'http://www.r12345.com/datafile/zy/'+id.substr(5)+'/'+id+'.png'
//       const fileName = `${id}.png`;
//       const filePath = `${downloadFolder}/${fileName}`;
//       if (fs.existsSync(filePath)) {
//         console.log(`File ${fileName} already exists in ${downloadFolder}`);
//       } else {
//         try {
//           console.log(`Downloading ${fileName} to ${downloadFolder}`);
//           await download(src, filePath);
//           console.log(`Downloaded ${fileName} to ${downloadFolder}`);
//         } catch (error) {
//           console.error(`Error downloading ${fileName}: ${error.message}`);
//         }
//       }
//     });
//     await Promise.all(promises);
//   }

//   async function downloadUrls(urls) {
//     const chunkSize = 10;
//     for (let i = 0; i < urls.length; i += chunkSize) {
//       const chunkUrls = urls.slice(i, i + chunkSize);
//       await downloadChunk(chunkUrls);
//     }
//   }

//   await downloadUrls(r12345_chars);
// })();

const srghma_chinese_r12345_textual__text = r12345_chars.map((hanzi) => {
  const id = encodeURIComponent(hanzi).replace(/%/g,'')
  const fileName = `${id}.png`;
  const img = `<img src="${fileName}">`
  // <definition-r><resource type="img" key="${fileName}"/></definition-r>
  return `<article><key>${hanzi}</key><definition type="h"><![CDATA[${img}]]></definition></article>`
}).join('\n\n')

fs.writeFileSync(`/tmp/srghma-chinese-r12345-textual.xml`, `<?xml version="1.0" encoding="UTF-8" ?>
<stardict>
<info>
  <version>3.0.0</version>
  <bookname>srghma chinese r12345</bookname>
  <author>Serhii Khoma</author>
  <email>srghma@gmail.com</email>
  <website>srghma-chinese2.github.io</website>
  <description>MIT copyright</description>
  <date>${new Date()}</date>
  <dicttype><!-- this element is normally empty --></dicttype>
</info>
<contents>
${srghma_chinese_r12345_textual__text}
</contents>
</stardict>`)

mkStardict("/tmp/srghma-chinese-r12345-textual.xml", "/home/srghma/Desktop/dictionaries/mychinese/srghma-chinese-r12345/")
