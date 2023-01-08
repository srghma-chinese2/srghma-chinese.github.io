#!/usr/bin/env node
'use strict';

const path = require('path')
const serveStatic = require('serve-static')
const R = require('ramda')
const isHanzi = require('/home/srghma/projects/anki-cards-from-pdf/scripts/lib/isHanzi').isHanzi
const splitBySeparator = require('/home/srghma/projects/anki-cards-from-pdf/scripts/lib/splitBySeparator').splitBySeparator
const TongWen = require('/home/srghma/projects/anki-cards-from-pdf/scripts/lib/TongWen').TongWen
const hanzijs = require("hanzi");
//Initiate
hanzijs.start();

///////////////////////////////////////////

const removeLinks = x => x.replace(/<link>[^<]*<\/link>/g, '')

function ruPinyinTextToArray(text) {
  text = text.replace(/\t/g, '').split(/―{4,}|-{4,}/)
  text = text.map(x => x.split('\n').map(x => x.trim()).join('\n'))
  text = text.map(x => x.split(/_{3,}/).map(x => x.trim()).join(`\n\n______________\n\n`).trim())
  text = text.filter(x => x)
  return text
}

function getDuplicatedItems(someArray) {
    // check for misuse if desired
    // if (!Array.isArray(someArray)) {
    //     throw new TypeError(`getDuplicatedItems requires an Array type, received ${typeof someArray} type.`);
    // }
    const itemSet = new Set(someArray);
    const duplicatedItems = [...itemSet].filter(
        (item) => someArray.indexOf(item) !== someArray.lastIndexOf(item)
    );
    return duplicatedItems;
}

function throwIfDuplicate(ruPinyinArray) {
  const duplicated = getDuplicatedItems(ruPinyinArray.map(x => x.hanzi).flat())
  if (duplicated.length === 0) { return }
  throw new Error(duplicated.join(','))
}

// __dirname = '.'
const dbPath = `${__dirname}/ru-pinyin.txt`
const ruPinyinArray = ruPinyinTextToArray(require('fs').readFileSync(dbPath).toString())
require('fs').writeFileSync(dbPath, ruPinyinArray.join(`\n\n------------\n\n`))
let ruPinyinArray_ = ruPinyinArray.map(text => ({ text, hanzi: R.uniq([...(removeLinks(text))].filter(isHanzi)) }))
// ruPinyinArray_ = ruPinyinArray_.slice(825, 830)
throwIfDuplicate(ruPinyinArray_)

// NOTE: <to reach> will throw error
// lxml.etree.XMLSyntaxError: Specification mandates value for attribute reach

const getTone = R.cond([
  // [R.equals(1), R.always('blue')],
  // [R.equals(2), R.always('green')],
  // [R.equals(3), R.always('violet')],
  // [R.equals(4), R.always('red')],
  // [R.equals(5), R.always('gray')],
  [R.equals(1), R.always('#929eff')],
  [R.equals(2), R.always('#88ffc9')],
  [R.equals(3), R.always('#cb59ff')],
  [R.equals(4), R.always('#ff6f7c')],
  [R.equals(5), R.always('#a7a7a7')],
  [R.T,         temp => { throw new Error(temp) }]
])

const dict_output_text = ruPinyinArray_.map(({ text, hanzi }) => {
  if (/[^k-]>/g.test(text)) { throw new Error(text) }
  if (text.includes('&')) { throw new Error(text) }
  // text = text.replace(/&lt;link&gt;([^&]*)&lt;\/link&gt;/g, '<b>$1</b>')

  // text = text.replace(/&/g,'&amp;')
  // text = text.replace(/\>/g,'&gt;')
  // text = text.replace(/\</g,'&lt;')

  text = text.replace(/<link>([^<]*)<\/link>/g, '<b>$1</b>')
  text = text.replace(/-\>/g,'&gt;')
  // source code &lt; will display < on screen
  // source code &gt; will display > on screen
  // source code &amp; will display & on screen
  // if (text.includes('&')) { throw new Error(text) }
  // if (text.includes('<')) { throw new Error(text) }
  // if (text.includes('>')) { throw new Error(text) }
  const [hanzi_1, ...hanzi_other] = hanzi
  const hanzi_1_ = `<key>${hanzi_1}</key>`
  const hanzi_other_ = hanzi_other.map(x => `<synonym>${x}</synonym>`)
  // https://github.com/soshial/xdxf_makedict/tree/master/format_standard
  // https://github.com/huzheng001/stardict-3/blob/master/dict/doc/TextualDictionaryFileFormat
  // https://github.com/huzheng001/stardict-3/blob/master/dict/doc/StarDictFileFormat
  // https://github.com/huzheng001/stardict-3/blob/master/dict/doc/stardict-textual-dict-example.xml
  let value = text.replace(/\n/g, '<br/>')
  value = [...value].map(x => {
    const dict_hanzis = hanzijs.definitionLookup(x)
    if (!dict_hanzis) { return x }
    const dict_hanzi = dict_hanzis[0]
    const tone = parseInt(R.last(dict_hanzi.pinyin), 10)
    const toneColor = getTone(tone)
    return `<c c="${toneColor}">${x}</c>`
  }).join('')
  return `<article>${[hanzi_1_, ...hanzi_other_].join("\n")}<definition type="x"><![CDATA[${value}]]></definition></article>`
}).join('\n\n')

// [--direct|--indirect|--sqlite] [--no-alts]
// [--sort|--no-sort] [--sort-cache-size=2000]
// [|--no-utf8-check] [--lower|--no-lower]
// [--read-options=READ_OPTIONS] [--write-options=WRITE_OPTIONS]
// [--source-lang=LANGUAGE] [--target-lang=LANGUAGE]
// ['--name=GLOSSARY NAME']

require('fs').writeFileSync(`/home/srghma/Desktop/dictionaries/mychinese/srghma-chinese-stardict-textual.xml`, `<?xml version="1.0" encoding="UTF-8" ?>
<stardict>
<info>
  <version>3.0.0</version>
  <bookname>srghma chinese</bookname>
  <author>Serhii Khoma</author>
  <email>srghma@gmail.com</email>
  <website>srghma-chinese.github.io</website>
  <description>MIT copyright</description>
  <date>${new Date()}</date>
  <dicttype><!-- this element is normally empty --></dicttype>
</info>
<contents>
${dict_output_text}
</contents>
</stardict>`)

require("child_process").execSync(`export INPUT="/home/srghma/Desktop/dictionaries/mychinese/srghma-chinese-stardict-textual.xml" && export OUTPUT="/home/srghma/Desktop/dictionaries/mychinese/srghma-chinese-stardict/" && rm -rfd "$OUTPUT"  && mkdir -p "$OUTPUT" && cd ~/projects/pyglossary && nix-shell -p pkgs.gobject-introspection python38Packages.pygobject3 python38Packages.pycairo python38Packages.prompt_toolkit python38Packages.lxml pkgs.dict --run 'python3 main.py --ui=cmd "$INPUT" "$OUTPUT" --utf8-check --read-format=StardictTextual --write-format=Stardict'`)

const x = JSON.parse(require('fs').readFileSync('./files/anki.json').toString()); null

// R.toPairs(x).map(([key, value]) => {
// })

const removeHTML = require('/home/srghma/projects/anki-cards-from-pdf/scripts/lib/removeHTML').removeHTML
const { JSDOM } = require("jsdom");
const dom = new JSDOM(``);

const dict_output_text_purple = R.toPairs(x).map(([key, { purpleculture_hsk, purpleculture_info, purpleculture_tree, charactersWithComponent }]) => {
  // if (key !== '着') { return }
  const process = (text) => {
    text = text.replace(/\n+/g, '\n')
    text = text.trim()
    // console.log('1', text)
    text = text.replace(/\<li\>/g, '\n<li>')
    text = text.replace(/<\/div><div>/g, '</div>\n<div>')
    // text = text.replace(/\n/g, '<br/>')
    // console.log('2', text)
    text = removeHTML(dom, text)
    text = text.replace(/\n+/g, '\n')
    text = text.replace(/\n/g, '<br/>')
    // console.log('3', text)
    return text
  }
  if (purpleculture_tree) { purpleculture_tree = process(purpleculture_tree) }
  if (purpleculture_info) { purpleculture_info = process(purpleculture_info) }
  let value = [
    purpleculture_info      ? `purpleculture_info: ${purpleculture_info}` : '',
    purpleculture_hsk       ? `purpleculture_hsk: ${purpleculture_hsk}` : '',
    purpleculture_tree      ? `purpleculture_info: ${purpleculture_tree}` : '',
    charactersWithComponent ? `charactersWithComponent: ${charactersWithComponent.join(", ")}` : '',
  ].filter(x => x).join('<br/>')
  // console.log(value)
  return `<article><key>${key}</key><definition type="x"><![CDATA[${value}]]></definition></article>`
}).join('\n\n')

require('fs').writeFileSync(`/home/srghma/Desktop/dictionaries/mychinese/purplecultere-textual.xml`, `<?xml version="1.0" encoding="UTF-8" ?>
<stardict>
<info>
  <version>3.0.0</version>
  <bookname>srghma purpleculture</bookname>
  <author>Serhii Khoma</author>
  <email>srghma@gmail.com</email>
  <website>srghma-chinese.github.io</website>
  <description>MIT copyright</description>
  <date>${new Date()}</date>
  <dicttype><!-- this element is normally empty --></dicttype>
</info>
<contents>
${dict_output_text_purple}
</contents>
</stardict>`)

require("child_process").execSync(`export INPUT="/home/srghma/Desktop/dictionaries/mychinese/purplecultere-textual.xml" && export OUTPUT="/home/srghma/Desktop/dictionaries/mychinese/purplecultere/" && rm -rfd "$OUTPUT"  && mkdir -p "$OUTPUT" && cd ~/projects/pyglossary && nix-shell -p pkgs.gobject-introspection python38Packages.pygobject3 python38Packages.pycairo python38Packages.prompt_toolkit python38Packages.lxml pkgs.dict --run 'python3 main.py --ui=cmd "$INPUT" "$OUTPUT" --utf8-check --read-format=StardictTextual --write-format=Stardict'`)


// // https://www.plecoforums.com/threads/hainanese-resources-for-pleco.5825/#post-51457
// // https://www.plecoforums.com/threads/user-dictionaries-creation-import-file-format-etc.6934/#post-51042
// // SC[TC]<tab>pinyin<tab>definition
// R.toPairs(ruPinyinObjectCache).map(([key, value]) => { if (value.includes('\t')) { throw new Error } })
// const output = R.toPairs(ruPinyinObjectCache).map(([key, value]) => `${key}<tab><tab>${value.replace(/\n/g, '')}`).join('\n')
// console.log('done')
// require('fs').writeFileSync(`/home/srghma/pleco-user-dict.tsv`, output)
// require('fs').writeFileSync(`/home/srghma/pleco-user-dict.tsv`, output)

// const text = `#NAME "mychinese"
// #INDEX_LANGUAGE "Chinese"
// #CONTENTS_LANGUAGE "Russian"

// ${R.toPairs(ruPinyinObjectCache).map(([key, value]) => `${key}\n${value.split(/\n/g).map(x => `  [m1]${x}[/m]`).join('\n')}`).join('\n\n')}`
// const utf16buffer = Buffer.from(`\ufeff${text}`, 'utf16le');

// require('fs').writeFileSync(`/home/srghma/Desktop/mychinese/mychinese.dsl`, utf16buffer)
// // require('fs').writeFileSync(`/home/srghma/Dropbox/mychinese.dsl`, utf16buffer)
// // rclone copy /home/srghma/Desktop/mychinese/mychinese.dsl gdrive:mychinese.dsl
