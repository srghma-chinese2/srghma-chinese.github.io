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

const pinyinSplit = require('pinyin-split')
// const pinyinOrHanzi = require('pinyin-or-hanzi')
const pinyinUtils = require('pinyin-utils')

// const pinyinTone = require('pinyin-tone')
// const pinyinConvert = require('pinyin-convert')
//Initiate
hanzijs.start();

// https://github.com/pepebecker/pinyin-convert/blob/master/index.js
const convertPinyin__marked_to_numbered = text => {
  // // https://stackoverflow.com/questions/34629460/how-to-detect-chinese-character-with-punctuation-in-regex
  // // https://stackoverflow.com/questions/4328500/how-can-i-strip-all-punctuation-from-a-string-in-javascript-using-regex
  // const punctuationRegEx = /[!-/:-@[-`{-~¡-©«-¬®-±´¶-¸»¿×÷˂-˅˒-˟˥-˫˭˯-˿͵;΄-΅·϶҂՚-՟։-֊־׀׃׆׳-״؆-؏؛؞-؟٪-٭۔۩۽-۾܀-܍߶-߹।-॥॰৲-৳৺૱୰௳-௺౿ೱ-ೲ൹෴฿๏๚-๛༁-༗༚-༟༴༶༸༺-༽྅྾-࿅࿇-࿌࿎-࿔၊-၏႞-႟჻፠-፨᎐-᎙᙭-᙮᚛-᚜᛫-᛭᜵-᜶។-៖៘-៛᠀-᠊᥀᥄-᥅᧞-᧿᨞-᨟᭚-᭪᭴-᭼᰻-᰿᱾-᱿᾽᾿-῁῍-῏῝-῟῭-`´-῾\u2000-\u206e⁺-⁾₊-₎₠-₵℀-℁℃-℆℈-℉℔№-℘℞-℣℥℧℩℮℺-℻⅀-⅄⅊-⅍⅏←-⏧␀-␦⑀-⑊⒜-ⓩ─-⚝⚠-⚼⛀-⛃✁-✄✆-✉✌-✧✩-❋❍❏-❒❖❘-❞❡-❵➔➘-➯➱-➾⟀-⟊⟌⟐-⭌⭐-⭔⳥-⳪⳹-⳼⳾-⳿⸀-\u2e7e⺀-⺙⺛-⻳⼀-⿕⿰-⿻\u3000-〿゛-゜゠・㆐-㆑㆖-㆟㇀-㇣㈀-㈞㈪-㉃㉐㉠-㉿㊊-㊰㋀-㋾㌀-㏿䷀-䷿꒐-꓆꘍-꘏꙳꙾꜀-꜖꜠-꜡꞉-꞊꠨-꠫꡴-꡷꣎-꣏꤮-꤯꥟꩜-꩟﬩﴾-﴿﷼-﷽︐-︙︰-﹒﹔-﹦﹨-﹫！-／：-＠［-｀｛-･￠-￦￨-￮￼-�]|\ud800[\udd00-\udd02\udd37-\udd3f\udd79-\udd89\udd90-\udd9b\uddd0-\uddfc\udf9f\udfd0]|\ud802[\udd1f\udd3f\ude50-\ude58]|\ud809[\udc00-\udc7e]|\ud834[\udc00-\udcf5\udd00-\udd26\udd29-\udd64\udd6a-\udd6c\udd83-\udd84\udd8c-\udda9\uddae-\udddd\ude00-\ude41\ude45\udf00-\udf56]|\ud835[\udec1\udedb\udefb\udf15\udf35\udf4f\udf6f\udf89\udfa9\udfc3]|\ud83c[\udc00-\udc2b\udc30-\udc93]/g;
  // text = text.replace(punctuationRegEx, ' ')
  const words = pinyinSplit.split(text, true)
  return pinyinUtils.markToNumber(words, false).join('')
}

// convertPinyin__marked_to_numbered("nǎ gè xīng,  zuò， zuì pǐ pèi ?")
// before 'na3 ge4 xing1,  5zuo4， 5zui4 pi3 pei4 ?5'
// now 'na3 ge4 xing1   zuo4  zui4 pi3 pei4  '
// 'na3 ge4 xing1,  zuo4， zui4 pi3 pei4 ?'

const removeHTML = require('/home/srghma/projects/anki-cards-from-pdf/scripts/lib/removeHTML').removeHTML
const { JSDOM } = require("jsdom");
const dom = new JSDOM(``)

const { finished } = require('node:stream')
const { once } = require('events')

async function writeWithAwait(writable, chunk) {
  if (!writable.write(chunk)) {
    // Handle backpressure
    await once(writable, 'drain')
  }
}

function finishedAwait(stream) {
  return new Promise((resolve, reject) => {
    finished(stream, err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

const getTone = R.cond([
  // [R.equals(1), R.always('blue')],
  // [R.equals(2), R.always('green')],
  // [R.equals(3), R.always('violet')],
  // [R.equals(4), R.always('red')],
  // [R.equals(5), R.always('gray')],
  // [R.equals(1), R.always('#929eff')],
  // [R.equals(2), R.always('#88ffc9')],
  // [R.equals(3), R.always('#cb59ff')],
  // [R.equals(4), R.always('#ff6f7c')],
  // [R.equals(5), R.always('#a7a7a7')],
  [R.equals(1), R.always('cornflowerblue')],
  [R.equals(2), R.always('springgreen')],
  [R.equals(3), R.always('violet')],
  [R.equals(4), R.always('tomato')],
  [R.equals(5), R.always('gainsboro')],
  [R.T,         temp => { throw new Error(`Unknown tone: ${temp.toString()}`) }]
])

const colorizeHanzi = x => {
  const dict_hanzis = hanzijs.definitionLookup(x)
  if (!dict_hanzis) { return x }
  const dict_hanzi = dict_hanzis[0]
  const tone = parseInt(R.last(dict_hanzi.pinyin), 10)
  const toneColor = getTone(tone)
  return `<font color="${toneColor}">${x}</font>`
}

const colorizeHanzi__in_text = x => [...x].map(colorizeHanzi).join('')

const escapeHTML = str => str.replace(/[&<>'"]/g,
  tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag]))

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)
let pinyin = null
pinyin = require('/home/srghma/projects/anki-cards-from-pdf/pinyin-to-ru-by-kfcd.json')
pinyin = pinyin.map(([pinyin_numbered, pinyin_with_tone]) => ({ n: Number(pinyin_numbered.at(-1)), v: [pinyin_numbered, pinyin_with_tone] }))
pinyin = pinyin.filter(({ n, v }) => n !== 5)
pinyin = pinyin.map(({ n, v }) => v.map(v => ({ n, v }))).flat()
pinyin = pinyin.map(({ n, v }) => [v, `${v}r`].map(v => ({ n, v }))).flat()
pinyin = pinyin.map(({ n, v }) => [v, capitalize(v)].map(v => ({ n, v }))).flat()
pinyin = R.sortBy(({ n, v }) => v.length, pinyin).reverse()
pinyin = R.groupBy(({ n, v }) => n, pinyin)
pinyin = R.map(vs => `(${vs.map(x => x.v).join('|')})`, pinyin)
pinyin = R.toPairs(pinyin)
// pinyin = R.over(R.lensIndex(0), x => Number(x), pinyin)
pinyin = pinyin.map(([n, r]) => [Number(n), r])
pinyin = pinyin.map(([n, r]) => [getTone(n), r])
// pinyin = pinyin.map(({ n, v }) => ({ n, v, toneColor: getTone(n) }))
// console.log(util.inspect(pinyin, { maxArrayLength: Infinity, showHidden: false, depth: null, colors: true }))

function colorPinyin(text) {
  pinyin.forEach(([toneColor, r]) => {
    text = text.replace(new RegExp(r, 'g'), `<font color="${toneColor}">$1</font>`)
  })
  return text
}

colorPinyin("er4 shi2 yi1 san1 ti3 zong1 he2 zheng4")
colorPinyin("er4r shi2r yi1r san1r ti3r zong1r he2r zheng4r")
colorPinyin("er4shi2yi1san1ti3zong1he2zheng4")
colorPinyin("er4rshi2ryi1rsan1rti3rzong1rhe2rzheng4r")

// function colorPinyin(pinyin) {
//   // return pinyin.split(' ').map(pinyinEl => {
//   const includeNonPinyin = true
//   return require('pinyin-split').split(pinyin, includeNonPinyin).map(pinyinEl => {
//     const tone = require('pinyin-utils').getToneNumber(pinyinEl)
//     if (tone === undefined) { throw new Error(`${pinyinEl}`) }
//     if (tone === 5) { return pinyinEl }
//     const toneColor = getTone(tone)
//     return `<font color="${toneColor}">${escapeHTML(pinyinEl)}</font>`
//     // if (htmlAndNotXdxl) { return `<font color="${toneColor}">${escapeHTML(pinyinEl)}</font>` }
//     // return `<c c="${toneColor}">${escapeHTML(pinyinEl)}</c>`
//   // }).join(' ')
//   }).join('')
// }

///////////////////////////////////////////

const removeLinks = x => x.replace(/<link>[^<]*<\/link>/g, '')

function ruPinyinTextToArray(text) {
  text = text.replace(/\t/g, '').split(/―{4,}|-{4,}/)
  text = text.map(x => x.split('\n').map(x => x.trim()).join('\n'))
  text = text.map(x => x.split(/_{3,}/).map(x => x.trim()).filter(x => x).join(`\n\n______________\n\n`))
  text = text.filter(x => x.length > 0)
  text = text.map(x => x.replace(/^([\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d][\u3040-\u309f]|[\u30a0-\u30ff]|[\u4e00-\u9faf]|[\u3400-\u4dbf])([\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d][\u3040-\u309f]|[\u30a0-\u30ff]|[\u4e00-\u9faf]|[\u3400-\u4dbf])/g, '$1 $2'))
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const dbPath = `/home/srghma/projects/srghma-chinese/ru-pinyin.txt`
const ruPinyinArray = ruPinyinTextToArray(fs.readFileSync(dbPath).toString())
// const ruPinyinArray = []
fs.writeFileSync(dbPath, ruPinyinArray.join(`\n\n------------\n\n`))
let ruPinyinArray_ = ruPinyinArray.map(text => ({ text, hanzi: R.uniq([...(removeLinks(text))].filter(isHanzi)) }))
// ruPinyinArray_ = ruPinyinArray_.slice(825, 830)
throwIfDuplicate(ruPinyinArray_)

// NOTE: <to reach> will throw error
// lxml.etree.XMLSyntaxError: Specification mandates value for attribute reach

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const srghma_chinese_stardict_textual__text = ruPinyinArray_.map(({ text, hanzi }) => {
  // -> or <link>
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
  const value = colorPinyin(colorizeHanzi__in_text(text.replace(/\n/g, '<br/>')))
  return `<article>${[hanzi_1_, ...hanzi_other_].join("\n")}<definition type="h"><![CDATA[${value}]]></definition></article>`
}).join('\n\n')

// [--direct|--indirect|--sqlite] [--no-alts]
// [--sort|--no-sort] [--sort-cache-size=2000]
// [|--no-utf8-check] [--lower|--no-lower]
// [--read-options=READ_OPTIONS] [--write-options=WRITE_OPTIONS]
// [--source-lang=LANGUAGE] [--target-lang=LANGUAGE]
// ['--name=GLOSSARY NAME']

fs.writeFileSync(`/tmp/srghma-chinese-stardict-textual.xml`, `<?xml version="1.0" encoding="UTF-8" ?>
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

mkStardict("/tmp/srghma-chinese-stardict-textual.xml", "/home/srghma/Desktop/dictionaries/mychinese/srghma-chinese-stardict/")
// mkAard("/tmp/srghma-chinese-stardict-textual.xml", "/home/srghma/Desktop/dictionaries/mychinese/srghma-chinese-stardict.slob")

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const ankiJson = JSON.parse(fs.readFileSync('./files/anki.json').toString()); null
// const ankiJson = {}

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
  // const linkTranchinese = x => `<iref href="https://www.trainchinese.com/v2/search.php?searchWord=${encodeURIComponent(x)}">${x}</iref>`
  const linkTranchinese = x => `<a href="https://www.trainchinese.com/v2/search.php?searchWord=${encodeURIComponent(x)}">${x}</a>`

  let value = [
    purpleculture_info                ? `purpleculture_info: ${colorizeHanzi__in_text(purpleculture_info)}` : '',
    purpleculture_hsk                 ? `purpleculture_hsk: ${purpleculture_hsk}` : '',
    purpleculture_tree                ? `purpleculture_info: ${colorizeHanzi__in_text(purpleculture_tree)}` : '',
    charactersWithComponent           ? `charactersWithComponent: ${charactersWithComponent.map(colorizeHanzi).join(", ")}` : '',
    charactersWithComponent_hanziyuan ? `charactersWithComponent_hanziyuan: ${charactersWithComponent_hanziyuan.map(colorizeHanzi).join(", ")}` : '',
    `tranchinese: ${linkTranchinese(`${key}*`)}, ${linkTranchinese(`*${key}`)}`
  ].filter(x => x).map(x => `<p>${x}</p>`).join('')
  // console.log(value)
  return `<article><key>${key}</key><definition type="h"><![CDATA[${value}]]></definition></article>`
}).join('\n\n')

fs.writeFileSync(`/tmp/purpleculture-textual.xml`, `<?xml version="1.0" encoding="UTF-8" ?>
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


mkStardict("/tmp/purpleculture-textual.xml", "/home/srghma/Desktop/dictionaries/mychinese/purpleculture/")
// mkAard("/tmp/purpleculture-textual.xml", "/home/srghma/Desktop/dictionaries/mychinese/purpleculture.slob")

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const trainchinese_with_cache_path = '/home/srghma/projects/anki-cards-from-pdf/trainchinese_cache.json'
let trainchinese_cache = {}
if (fs.existsSync(trainchinese_with_cache_path)) { trainchinese_cache = JSON.parse(fs.readFileSync(trainchinese_with_cache_path).toString()) }; null

let trainchinese_cache_ = null
trainchinese_cache_ = Object.values(trainchinese_cache).flat().filter(R.identity)
trainchinese_cache_ = trainchinese_cache_.filter(x => x.type !== 'фраза')
trainchinese_cache_ = trainchinese_cache_.filter(x => x.type !== 'идиома')
trainchinese_cache_ = R.uniqBy(x => [x.ch.trim(), x.pinyin.trim(), x.transl.trim(), x.type.trim()].join(''), trainchinese_cache_)
trainchinese_cache_ = trainchinese_cache_.map(x => ({ ...x, pinyin_numbered: convertPinyin__marked_to_numbered(x.pinyin) }))
trainchinese_cache_ = trainchinese_cache_.map(x => ({ ...x, pinyin_colored_html: colorPinyin(x.pinyin) }))

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const alltrainchinese__hierogliphs = R.uniq([...trainchinese_cache_.map(x => x.ch).join('')]).filter(isHanzi)

const trainchinese_textual__writer = fs.createWriteStream(`/tmp/trainchinese-textual.xml`)
trainchinese_textual__writer.on('error', err => console.error(err))
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
      // return matches
      return R.sortBy(x => x.pinyin_numbered, matches)
    }

    let value = {
      ' ': get(`^${key}$`),

      'x.': get(`^${key}.$`),
      '.x': get(`^.${key}$`),

      'x..': get(`^${key}..$`),
      '.x.': get(`^.${key}.$`),
      '..x': get(`^..${key}$`),

      'x...': get(`^${key}...$`),
      '.x..': get(`^.${key}..$`),
      '..x.': get(`^..${key}.$`),
      '...x': get(`^...${key}$`),

      'x....': get(`^${key}....$`),
      '.x...': get(`^.${key}...$`),
      '..x..': get(`^..${key}..$`),
      '...x.': get(`^...${key}.$`),
      '....x': get(`^....${key}$`),

      'x.....': get(`^${key}.....$`),
      '.x....': get(`^.${key}....$`),
      '..x...': get(`^..${key}...$`),
      '...x..': get(`^...${key}..$`),
      '....x.': get(`^....${key}.$`),
      '.....x': get(`^.....${key}$`),

      'x*':    get(`^${key}`),
      // '*x':    get(`${key}$`),
      'other': get(`.`),
    }

    value = R.toPairs(value).filter(([k, v]) => v.length > 0)

    value = value.map(([k, v]) => {
      const print = withCh => ({ ch, pinyin_colored_html, transl, type }) => {
        return [
          withCh ? colorizeHanzi__in_text(ch) : null,
          `<font color="green">${escapeHTML(type)}</font>`,
          pinyin_colored_html,
          escapeHTML(transl),
        ].filter(x => x).join(escapeHTML(' | '))
      }

      return [
        k.trim() ? `<big>${k}</big>` : null,
        ...(v.map(print(!!k.trim())))
      ]
    }).flat().filter(x => x).join('<br/>')
    // console.log(value)

    if (value.length > 0) {
      await writeWithAwait(trainchinese_textual__writer, `<article><key>${key}</key><definition type="h"><![CDATA[${value}]]></definition></article>\n\n`)
    }
  }

  await writeWithAwait(trainchinese_textual__writer, `</contents></stardict>`)
  trainchinese_textual__writer.end()
  const maybeFinishError = await finishedAwait(trainchinese_textual__writer)
  if (maybeFinishError) {
    console.error('Stream failed.', maybeFinishError)
    return
  }
  console.log('Stream is finished.');

  mkStardict("/tmp/trainchinese-textual.xml", "/home/srghma/Desktop/dictionaries/mychinese/trainchinese/")
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// trainchinese_cache_ = R.sortBy(x => x.ch.length).reverse()

// types_that_should_not_be_included = ['фраза', 'идиома']

let trainchinese_cache__ = trainchinese_cache_
// trainchinese_cache__ = trainchinese_cache__.filter(x => x.type !== 'фраза')
// trainchinese_cache__ = trainchinese_cache__.filter(x => x.type !== 'идиома')

// trainchinese_cache_ = trainchinese_cache_.filter(x => x.ch.length > 5)
// trainchinese_cache_ = R.groupBy(x => x.type, trainchinese_cache_)
// Object.keys(trainchinese_cache_)

function rutranslation_splitOnWords(text) {
  text = text.toLowerCase()
  text = [...text].filter(x => !isHanzi(x)).join('')
  text = text.replace(/^\([^\)]+\)/g, ', ')
  text = text.replace(/([,;]\s*)\([^\)]+\)/g, '$1')
  text = text.replace(/\([^\)]+\)$/g, ',')
  text = text.replace(/\([^\)]+\)([,;])/g, '$1')
  text = text.replace(/ и /g, ',')
  text = text.replace(/\(обр\.\)/g, ',')
  text = text.replace(/так([^,]*), как/g, 'так$1 как')
  text = text.split(/[,;\.:\s\"]/g)
  text = text.map(x => x.trim()).filter(x => x).filter(x => !x.startsWith('см.'))
  return text
}
rutranslation_splitOnWords('привлекающий внимание, яркий и живой; ясноглазый (исп. невидящим человеком по отношению к людям, которые могут видеть); (обр.) способный замечать или видеть вещи такими, какие они есть')
rutranslation_splitOnWords('(о голосе) звонкий, светить(ся)')

trainchinese_cache__ = trainchinese_cache__.map(x => ({ ...x, transl__splitted: rutranslation_splitOnWords(x.transl) }))
trainchinese_cache__ = trainchinese_cache__.map(x => x.transl__splitted.map(search_word => ({ ...x, search_word }))).flat()
trainchinese_cache__ = R.groupBy(x => x.search_word, trainchinese_cache__)

const trainchinese_ru_textual__writer = fs.createWriteStream(`/tmp/trainchinese_ru-textual.xml`)
trainchinese_ru_textual__writer.on('error', err => console.error(err))
trainchinese_ru_textual__writer.on('open', async function() {
  await writeWithAwait(trainchinese_ru_textual__writer, `<?xml version="1.0" encoding="UTF-8" ?>
  <stardict>
  <info>
    <version>3.0.0</version>
    <bookname>srghma trainchinese ru</bookname>
    <author>Serhii Khoma</author>
    <email>srghma@gmail.com</email>
    <website>srghma-chinese.github.io</website>
    <description>MIT copyright</description>
    <date>${new Date()}</date>
    <dicttype><!-- this element is normally empty --></dicttype>
  </info>
  <contents>`)

  // console.log(alltrainchinese__hierogliphs.slice(0, 4))
  for await (let [key, chWords] of R.toPairs(trainchinese_cache__)) {
    // console.log(key)
    chWords = R.groupBy(x => [...x.ch].length, chWords)
    chWords = R.values(chWords)
    chWords = chWords.map(R.sortBy(x => x.pinyin_numbered)).flat()

    chWords = chWords.map(({ ch, pinyin_colored_html, transl, type }) => {
      return [
        colorizeHanzi__in_text(ch),
        `<font color="green">${escapeHTML(type)}</font>`,
        pinyin_colored_html,
        escapeHTML(transl),
      ].filter(x => x).join(escapeHTML(' | '))
    }).flat().filter(x => x).join('<br/>')
    // console.log(value)

    await writeWithAwait(trainchinese_ru_textual__writer, `<article><key>${key}</key><definition type="h"><![CDATA[${chWords}]]></definition></article>\n\n`)
  }

  await writeWithAwait(trainchinese_ru_textual__writer, `</contents></stardict>`)
  trainchinese_ru_textual__writer.end()
  const maybeFinishError = await finishedAwait(trainchinese_ru_textual__writer)
  if (maybeFinishError) {
    console.error('Stream failed.', maybeFinishError)
    return
  }
  console.log('Stream is finished.');

  mkStardict("/tmp/trainchinese_ru-textual.xml", "/home/srghma/Desktop/dictionaries/mychinese/trainchinese_ru/")
})

///////////////////////////////////////////////////////

const mkCCCEDICTToTextual = (input, output) => require("child_process").execSync(`export INPUT="${input}" && export OUTPUT="${output}" && rm -rf "$OUTPUT" && cd ~/projects/pyglossary && nix-shell -p pkgs.gobject-introspection python38Packages.pygobject3 python38Packages.pycairo python38Packages.prompt_toolkit python38Packages.lxml python38Packages.PyICU pkgs.dict --run 'python3 main.py --ui=cmd "$INPUT" "$OUTPUT" --utf8-check --read-format=CC-CEDICT --write-format=StardictTextual'`)

mkCCCEDICTToTextual("/home/srghma/Downloads/cedict_1_0_ts_utf-8_mdbg/cedict_ts.u8", "/tmp/cc-cedict-textual.xml")

let cccedicttextual = fs.readFileSync("/tmp/cc-cedict-textual.xml").toString()

// cccedicttextual = '<article>\n' +
// '<key>88</key>\n' +
// '<synonym>ba1 ba1</synonym>\n' +
// '<synonym>bye-bye</synonym>\n' +
// '<definition type="h"><![CDATA[<div style="border: 1px solid"><div><big><div style="display: inline-block"><font color="cornflowerblue">8</font><font color="cornflowerblue">8</font></div></big><br><big><div style="display: inline-block"><font color="cornflowerblue">bā</font><font color="cornflowerblue">bā</font></div></big></div><div><ul><li>(Internet slang) bye-bye (alternative for 拜拜[bai2 bai2])</li></ul></div></div>]]></definition>\n' +
// '</article>'

cccedicttextual = cccedicttextual.replace(/; padding: 5px/g,      '')
cccedicttextual = cccedicttextual.replace(/font color="red"/g,    `font color="${getTone(1)}"`)
cccedicttextual = cccedicttextual.replace(/font color="orange"/g, `font color="${getTone(2)}"`)
cccedicttextual = cccedicttextual.replace(/font color="green"/g,  `font color="${getTone(3)}"`)
cccedicttextual = cccedicttextual.replace(/font color="blue"/g,   `font color="${getTone(4)}"`)
cccedicttextual = cccedicttextual.replace(/font color="black"/g,  `font color="${getTone(5)}"`)
cccedicttextual = cccedicttextual.replaceAll(/(CDATA\[.*<\/big>)([^\n]+)/g,  (match, p1, p2) => {
  // console.log({ p1, p2 })
  return p1 + colorPinyin(colorizeHanzi__in_text(p2)).replace(/\[/g, ' [')
})

fs.writeFileSync("/tmp/cc-cedict-textual.xml", cccedicttextual)
mkStardict("/tmp/cc-cedict-textual.xml", "/home/srghma/Desktop/dictionaries/mychinese/cc-cedict/")

///////////////////////////////////////////////////////

// // https://www.plecoforums.com/threads/hainanese-resources-for-pleco.5825/#post-51457
// // https://www.plecoforums.com/threads/user-dictionaries-creation-import-file-format-etc.6934/#post-51042
// // SC[TC]<tab>pinyin<tab>definition
// R.toPairs(ruPinyinObjectCache).map(([key, value]) => { if (value.includes('\t')) { throw new Error } })
// const output = R.toPairs(ruPinyinObjectCache).map(([key, value]) => `${key}<tab><tab>${value.replace(/\n/g, '')}`).join('\n')
// console.log('done')
// fs.writeFileSync(`/home/srghma/pleco-user-dict.tsv`, output)
// fs.writeFileSync(`/home/srghma/pleco-user-dict.tsv`, output)

// const text = `#NAME "mychinese"
// #INDEX_LANGUAGE "Chinese"
// #CONTENTS_LANGUAGE "Russian"

// ${R.toPairs(ruPinyinObjectCache).map(([key, value]) => `${key}\n${value.split(/\n/g).map(x => `  [m1]${x}[/m]`).join('\n')}`).join('\n\n')}`
// const utf16buffer = Buffer.from(`\ufeff${text}`, 'utf16le');

// fs.writeFileSync(`/home/srghma/Desktop/mychinese/mychinese.dsl`, utf16buffer)
// // fs.writeFileSync(`/home/srghma/Dropbox/mychinese.dsl`, utf16buffer)
// // rclone copy /home/srghma/Desktop/mychinese/mychinese.dsl gdrive:mychinese.dsl
