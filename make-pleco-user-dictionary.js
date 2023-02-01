#!/usr/bin/env node
'use strict';

const path = require('path')
const fs = require('fs')
const serveStatic = require('serve-static')
const R = require('ramda')
const isHanzi = require('/home/srghma/projects/anki-cards-from-pdf/scripts/lib/isHanzi').isHanzi
const splitBySeparator = require('/home/srghma/projects/anki-cards-from-pdf/scripts/lib/splitBySeparator').splitBySeparator
const TongWen = require('/home/srghma/projects/anki-cards-from-pdf/scripts/lib/TongWen').TongWen
const hanzijs = require("hanzi");
//Initiate
// hanzijs.start();

const removeHTML = require('/home/srghma/projects/anki-cards-from-pdf/scripts/lib/removeHTML').removeHTML
const { JSDOM } = require("jsdom");
const dom = new JSDOM(``);

///////////////////////////////////////////

const removeLinks = x => x.replace(/<link>[^<]*<\/link>/g, '')

function ruPinyinTextToArray(text) {
  text = text.replace(/\t/g, '').split(/―{4,}|-{4,}/)
  text = text.map(x => x.split('\n').map(x => x.trim()).join('\n'))
  text = text.map(x => x.split(/_{3,}/).map(x => x.trim()).filter(x => x).join(`\n\n______________\n\n`))
  text = text.filter(x => x.length > 0)
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
// const ruPinyinArray = ruPinyinTextToArray(require('fs').readFileSync(dbPath).toString())
const ruPinyinArray = []
// require('fs').writeFileSync(dbPath, ruPinyinArray.join(`\n\n------------\n\n`))
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
  [R.T,         temp => { throw new Error(`Unknown tone: ${temp.toString()}`) }]
])

const colorizeHanzi = x => {
  const dict_hanzis = hanzijs.definitionLookup(x)
  if (!dict_hanzis) { return x }
  const dict_hanzi = dict_hanzis[0]
  const tone = parseInt(R.last(dict_hanzi.pinyin), 10)
  const toneColor = getTone(tone)
  return `<c c="${toneColor}">${x}</c>`
}

const colorizeHanzi__in_text = x => [...x].map(colorizeHanzi).join('')

const srghma_chinese_stardict_textual__text = ruPinyinArray_.map(({ text, hanzi }) => {
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
  const value = colorizeHanzi__in_text(text.replace(/\n/g, '<br/>'))
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
${srghma_chinese_stardict_textual__text}
</contents>
</stardict>`)

const mkStardict = (input, output) => require("child_process").execSync(`export INPUT="${input}" && export OUTPUT="${output}" && rm -rfd "$OUTPUT" && mkdir -p "$OUTPUT" && cd ~/projects/pyglossary && nix-shell -p pkgs.gobject-introspection python38Packages.pygobject3 python38Packages.pycairo python38Packages.prompt_toolkit python38Packages.lxml python38Packages.PyICU pkgs.dict --run 'python3 main.py --ui=cmd "$INPUT" "$OUTPUT" --utf8-check --read-format=StardictTextual --write-format=Stardict'`)

const mkAard = (input, output) => require("child_process").execSync(`export INPUT="${input}" && export OUTPUT="${output}" && rm -rf "$OUTPUT" && cd ~/projects/pyglossary && nix-shell -p pkgs.gobject-introspection python38Packages.pygobject3 python38Packages.pycairo python38Packages.prompt_toolkit python38Packages.lxml python38Packages.PyICU pkgs.dict --run 'python3 main.py --ui=cmd "$INPUT" "$OUTPUT" --utf8-check --read-format=StardictTextual --write-format=Aard2Slob'`)

// mkStardict("/home/srghma/Desktop/dictionaries/mychinese/srghma-chinese-stardict-textual.xml", "/home/srghma/Desktop/dictionaries/mychinese/srghma-chinese-stardict/")
// mkAard("/home/srghma/Desktop/dictionaries/mychinese/srghma-chinese-stardict-textual.xml", "/home/srghma/Desktop/dictionaries/mychinese/srghma-chinese-stardict.slob")

// const ankiJson = JSON.parse(require('fs').readFileSync('./files/anki.json').toString()); null
const ankiJson = {}

// R.toPairs(ankiJson).map(([key, value]) => {
// })


const dict_output_text_purple = R.toPairs(ankiJson).map(([key, { purpleculture_hsk, purpleculture_info, purpleculture_tree, charactersWithComponent, charactersWithComponent_hanziyuan }]) => {
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

  // WHF!!! bc of &??
  // const linkTranchinese = x => `<iref href="https://www.trainchinese.com/v2/search.php?searchWord=${encodeURIComponent(x)}&tcLanguage=ru">${x}</iref>`
  const linkTranchinese = x => `<iref href="https://www.trainchinese.com/v2/search.php?searchWord=${encodeURIComponent(x)}">${x}</iref>`

  let value = [
    purpleculture_info                ? `purpleculture_info: ${colorizeHanzi__in_text(purpleculture_info)}` : '',
    purpleculture_hsk                 ? `purpleculture_hsk: ${purpleculture_hsk}` : '',
    purpleculture_tree                ? `purpleculture_info: ${colorizeHanzi__in_text(purpleculture_tree)}` : '',
    charactersWithComponent           ? `charactersWithComponent: ${charactersWithComponent.map(colorizeHanzi).join(", ")}` : '',
    charactersWithComponent_hanziyuan ? `charactersWithComponent_hanziyuan: ${charactersWithComponent_hanziyuan.map(colorizeHanzi).join(", ")}` : '',
    `tranchinese: ${linkTranchinese(`${key}*`)}, ${linkTranchinese(`*${key}`)}`
  ].filter(x => x).join('<br/>')
  // console.log(value)
  return `<article><key>${key}</key><definition type="x"><![CDATA[${value}]]></definition></article>`
}).join('\n\n')

require('fs').writeFileSync(`/home/srghma/Desktop/dictionaries/mychinese/purpleculture-textual.xml`, `<?xml version="1.0" encoding="UTF-8" ?>
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

// mkStardict("/home/srghma/Desktop/dictionaries/mychinese/purpleculture-textual.xml", "/home/srghma/Desktop/dictionaries/mychinese/purpleculture/")
// mkAard("/home/srghma/Desktop/dictionaries/mychinese/purpleculture-textual.xml", "/home/srghma/Desktop/dictionaries/mychinese/purpleculture.slob")

const trainchinese_with_cache_path = '/home/srghma/projects/anki-cards-from-pdf/trainchinese_cache.json'
let trainchinese_cache = {}
if (fs.existsSync(trainchinese_with_cache_path)) { trainchinese_cache = JSON.parse(fs.readFileSync(trainchinese_with_cache_path).toString()) }; null

let trainchinese_cache_ = Object.values(trainchinese_cache).flat().filter(R.identity)
trainchinese_cache_ = R.uniqBy(x => [x.ch, x.pinyin, x.transl, x.type].join(''), trainchinese_cache_)

const alltrainchinese__hierogliphs = R.uniq([...trainchinese_cache_.map(x => x.ch).join('')]).filter(isHanzi)

// function joinHanziAndTones(hanzi, pinyin) {
//   let hanziArray = [...hanzi]
//   // hanziArray = hanziArray.join('|')
//   // hanziArray = hanziArray.replace(/([妞那点事会味])\|儿/g, '$1儿')
//   // hanziArray = hanziArray.split('|')

//   const pinyinArray = pinyin.replace(/[\.,\!\-\?]/g, ' ').split(' ').map(x => x.trim()).filter(x => x)

//   return pinyinArray.map(pinyin => {
//     const tone = require('pinyin-utils').getToneNumber(pinyin)
//     if (tone === undefined) { throw new Error(`${pinyin}`) }
//     const toneColor = getTone(tone)
//     const erization = pinyin.endsWith('r')
//     let hanziInput = null
//     if (erization) {
//       const [hanziArray_1, hanziArray_2, ...hanziArray_other] = hanziArray
//       const [hanziArray_other__notHanzi, hanziArray_other__other] = R.splitWhen(isHanzi, hanziArray_other)
//       if (!isHanzi(hanziArray_1)) { throw new Error(`hanziArray_1 ${hanziArray_1}`) }
//       if (!isHanzi(hanziArray_2)) { throw new Error(`hanziArray_2 ${hanziArray_2}`) }
//       hanziInput = `<c c="${toneColor}">${hanziArray_1}${hanziArray_2}</c>${hanziArray_other__notHanzi}`
//       hanziArray = hanziArray_other__other
//     } else {
//       const [hanziArray_1, ...hanziArray_other] = hanziArray
//       const [hanziArray_other__notHanzi, hanziArray_other__other] = R.splitWhen(isHanzi, hanziArray_other)
//       hanziInput = `<c c="${toneColor}">${hanziArray_1}</c>${hanziArray_other__notHanzi}`
//       hanziArray = hanziArray_other__other
//     }
//     return hanziInput
//   }).join('')

//   if (hanziArray.length !== 0) { throw new Error(`${hanzi} ${pinyin} ${tonesArray__buffer}`) }

//   // const tonesArray__initial = pinyinArray.map(require('pinyin-utils').getToneNumber)

//   // // if (hanziArray.filter(isHanzi).length !== tonesArray.length) { throw new Error(`${hanziArray.toString()} !== ${tonesArray.toString()}`) }
//   // let tonesArray__buffer = tonesArray__initial
//   // const output = hanziArray.map(hanzi => {
//   //   if (isHanzi(hanzi[0])) {
//   //     // if (hanzi === '儿') { return '儿' }
//   //     const [tone, ...other_tonesArray] = tonesArray__buffer
//   //     if (tone === undefined) { throw new Error(`${hanziArray} ${pinyin} ${tonesArray__initial}`) }
//   //     tonesArray__buffer = other_tonesArray
//   //     // try {
//   //       const toneColor = getTone(tone)
//   //       return `<c c="${toneColor}">${hanzi}</c>`
//   //     // } catch (e) {
//   //     //   console.error(e)
//   //     //   throw e
//   //     // }
//   //   } else {
//   //     return hanzi
//   //   }
//   // })
//   // if (tonesArray__buffer.length !== 0) { throw new Error(`${hanzi} ${pinyin} ${tonesArray__buffer}`) }
//   // return output.join('')
// }

// joinHanziAndTones('这个灯泡太亮了，有点刺眼。', 'zhè gè dēng pào tài liàng le, yóu diǎn cì yǎn .')
// joinHanziAndTones('看！来了一个漂亮妞儿。', 'kàn ! lái le yí ge piào liang niūr .')

// trainchinese_cache_ = trainchinese_cache_.map(({ ch, pinyin, transl, type }) => {
//   try {
//     const rendered = joinHanziAndTones(ch, pinyin)
//     return { ch, pinyin, transl, type, rendered }
//   } catch (e) {
//     console.log({ ch, pinyin })
//     // throw e
//   }
// })

// trainchinese_cache_ = trainchinese_cache_.map(({ ch, pinyin, transl, type }) => {
//   return { ch, rendered: `${ch} | ${type} | ${pinyin} | ${transl}` }
// })

const trainchinese_textual__writer = require('fs').createWriteStream(`/home/srghma/Desktop/dictionaries/mychinese/trainchinese-textual.xml`)

trainchinese_textual__writer.on('error', err => console.error(err))

async function writeWithAwait(writable, chunk) {
  const { once } = require('events')
  if (!writable.write(chunk)) { // (B)
    // Handle backpressure
    await once(writable, 'drain');
  }
}

trainchinese_textual__writer.on('open', async function() {
  await writeWithAwait(trainchinese_textual__writer, `<?xml version="1.0" encoding="UTF-8" ?>
  <stardict>
  <info>
    <version>3.0.0</version>
    <bookname>srghma trainchinese</bookname>
    <author>Serhii Khoma</author>
    <email>srghma@gmail.com</email>
    <website>srghma-chinese.github.io</website>
    <description>MIT copyright</description>
    <date>${new Date()}</date>
    <dicttype><!-- this element is normally empty --></dicttype>
  </info>
  <contents>`)

  // console.log(alltrainchinese__hierogliphs.slice(0, 4))
  for await (const key of alltrainchinese__hierogliphs) {
    // console.log(key)
    let trainchinese_cache_current = trainchinese_cache_.filter(({ ch }) => ch.includes(key))
    const get = r => {
      const [matches, doesntmatch] = R.partition(s => (new RegExp(r)).test(s.ch), trainchinese_cache_current)
      trainchinese_cache_current = doesntmatch
      return matches
    }

    let value = {
      ' ':     get(`^${key}$`),
      'x.':    get(`^${key}.$`),
      '.x':    get(`^.${key}$`),
      'x..':   get(`^${key}..$`),
      '.x.':   get(`^.${key}.$`),
      '..x':   get(`^..${key}$`),
      // 'x*':    get(`^${key}`),
      // '*x':    get(`${key}$`),
      // 'other': get(`.`),
    }

    value = R.toPairs(value).filter(([k, v]) => v.length > 0)

    const escapeHTML = str => str.replace(/[&<>'"]/g,
      tag => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[tag]));

    value = value.map(([k, v]) => {
      const print = withCh => ({ ch, pinyin, transl, type }) => {
        pinyin = pinyin.split(' ').map(pinyinEl => {
          const tone = require('pinyin-utils').getToneNumber(pinyinEl)
          if (tone === undefined) { throw new Error(`${pinyinEl}`) }
          if (tone === 5) { return pinyinEl }
          const toneColor = getTone(tone)
          return `<c c="${toneColor}">${pinyinEl}</c>`
        }).join(' ')

        return [
          withCh ? escapeHTML(ch) : null,
          ` <pos>${escapeHTML(type)}</pos>`,
          ` ${pinyin}`,
          `${escapeHTML(transl)}`,
        ].filter(x => x).join(escapeHTML(' | '))
      }

      return [
        k.trim() ? k : null,
        ...(v.map(print(!!k.trim())))
      ]
    }).flat().filter(x => x).join('<br/>')
    // console.log(value)

    if (value.length > 0) {
      await writeWithAwait(trainchinese_textual__writer, `<article><key>${key}</key><definition type="x"><![CDATA[${value}]]></definition></article>\n\n`)
    }
  }

  await writeWithAwait(trainchinese_textual__writer, `</contents></stardict>`)
  // trainchinese_textual__writer.on("end", () => {
  // })
  trainchinese_textual__writer.end()
  const { finished } = require('node:stream');
  finished(trainchinese_textual__writer, err => {
    if (err) {
      console.error('Stream failed.', err);
    } else {
      console.log('Stream is done reading.');
      mkStardict("/home/srghma/Desktop/dictionaries/mychinese/trainchinese-textual.xml", "/home/srghma/Desktop/dictionaries/mychinese/trainchinese/")
    }
  })
})

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
