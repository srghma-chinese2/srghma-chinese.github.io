#!/usr/bin/env node
'use strict';

const path = require('path')
const fs = require('fs')
const R = require('ramda')
const isHanzi = require('/home/srghma/projects/anki-cards-from-pdf/scripts/lib/isHanzi').isHanzi
const TongWen = require('/home/srghma/projects/anki-cards-from-pdf/scripts/lib/TongWen').TongWen
const removeHTML = require('/home/srghma/projects/anki-cards-from-pdf/scripts/lib/removeHTML').removeHTML
const { JSDOM } = require("jsdom")
const dom = new JSDOM(``)

const {
  convertPinyin__marked_to_numbered,
  writeWithAwait,
  finishedAwait,
  getTone,
  colorizeHanzi,
  colorizeHanzi__in_text,
  escapeHTML,
  colorPinyin,
  removeLinks,
  ruPinyinTextToArray,
  getDuplicatedItems,
  throwIfDuplicate,
  mkStardict,
  mkDslToStardict,
  mkAard,
  mkCCCEDICTToTextual,
} = require('./make-pleco-user-dictionary--utils.js')

// const pinyinOrHanzi = require('pinyin-or-hanzi')

// const pinyinTone = require('pinyin-tone')
// const pinyinConvert = require('pinyin-convert')

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

//////////////////// const srghma_chinese_stardict_textual__text = ruPinyinArray_.map(({ text, hanzi }) => {
////////////////////   // -> or <link>
////////////////////   if (/[^k-]>/g.test(text)) { throw new Error(text) }
////////////////////   if (text.includes('&')) { throw new Error(text) }
////////////////////   // text = text.replace(/&lt;link&gt;([^&]*)&lt;\/link&gt;/g, '<b>$1</b>')
////////////////////
////////////////////   // text = text.replace(/&/g,'&amp;')
////////////////////   // text = text.replace(/\>/g,'&gt;')
////////////////////   // text = text.replace(/\</g,'&lt;')
////////////////////
////////////////////   text = text.replace(/<link>([^<]*)<\/link>/g, '<b>$1</b>')
////////////////////
////////////////////   text = text.replace(/-\>/g,'&gt;')
////////////////////   // source code &lt; will display < on screen
////////////////////   // source code &gt; will display > on screen
////////////////////   // source code &amp; will display & on screen
////////////////////   // if (text.includes('&')) { throw new Error(text) }
////////////////////   // if (text.includes('<')) { throw new Error(text) }
////////////////////   // if (text.includes('>')) { throw new Error(text) }
////////////////////   const [hanzi_1, ...hanzi_other] = hanzi
////////////////////   const hanzi_1_ = `<key>${hanzi_1}</key>`
////////////////////   const hanzi_other_ = hanzi_other.map(x => `<synonym>${x}</synonym>`)
////////////////////   // https://github.com/soshial/xdxf_makedict/tree/master/format_standard
////////////////////   // https://github.com/huzheng001/stardict-3/blob/master/dict/doc/TextualDictionaryFileFormat
////////////////////   // https://github.com/huzheng001/stardict-3/blob/master/dict/doc/StarDictFileFormat
////////////////////   // https://github.com/huzheng001/stardict-3/blob/master/dict/doc/stardict-textual-dict-example.xml
////////////////////   const value = colorPinyin(colorizeHanzi__in_text(text.replace(/\n/g, '<br/>')))
////////////////////   return `<article>${[hanzi_1_, ...hanzi_other_].join("\n")}<definition type="h"><![CDATA[${value}]]></definition></article>`
//////////////////// }).join('\n\n')
////////////////////
//////////////////// // [--direct|--indirect|--sqlite] [--no-alts]
//////////////////// // [--sort|--no-sort] [--sort-cache-size=2000]
//////////////////// // [|--no-utf8-check] [--lower|--no-lower]
//////////////////// // [--read-options=READ_OPTIONS] [--write-options=WRITE_OPTIONS]
//////////////////// // [--source-lang=LANGUAGE] [--target-lang=LANGUAGE]
//////////////////// // ['--name=GLOSSARY NAME']
////////////////////
//////////////////// fs.writeFileSync(`/tmp/srghma-chinese-stardict-textual.xml`, `<?xml version="1.0" encoding="UTF-8" ?>
//////////////////// <stardict>
//////////////////// <info>
////////////////////   <version>3.0.0</version>
////////////////////   <bookname>srghma chinese</bookname>
////////////////////   <author>Serhii Khoma</author>
////////////////////   <email>srghma@gmail.com</email>
////////////////////   <website>srghma-chinese.github.io</website>
////////////////////   <description>MIT copyright</description>
////////////////////   <date>${new Date()}</date>
////////////////////   <dicttype><!-- this element is normally empty --></dicttype>
//////////////////// </info>
//////////////////// <contents>
//////////////////// ${srghma_chinese_stardict_textual__text}
//////////////////// </contents>
//////////////////// </stardict>`)
////////////////////
//////////////////// mkStardict("/tmp/srghma-chinese-stardict-textual.xml", "/home/srghma/Desktop/dictionaries/mychinese/srghma-chinese-stardict/")
//////////////////// // mkAard("/tmp/srghma-chinese-stardict-textual.xml", "/home/srghma/Desktop/dictionaries/mychinese/srghma-chinese-stardict.slob")
////////////////////
//////////////////// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////
//////////////////// // http://lingvo.helpmax.net/en/troubleshooting/dsl-compiler/text-formatting/
//////////////////// const makeBKRS = (file) => {
////////////////////   let cccedicttextual = fs.readFileSync(`/home/srghma/Downloads/${file}`).toString()
////////////////////   cccedicttextual = colorPinyin(cccedicttextual, true)
////////////////////   cccedicttextual = cccedicttextual.replaceAll(/\[ex\](.+?)\[\/ex\]/g,  (match, p1) => {
////////////////////     // console.log({ p1, p2 })
////////////////////     return `[ex]${colorizeHanzi__in_text(p1, true)}[/ex]`
////////////////////   })
////////////////////   // fs.writeFileSync(`/tmp/${file}.dsl`, cccedicttextual)
////////////////////   // mkDslToStardict(`/tmp/${file}.dsl`, `/home/srghma/Desktop/dictionaries/mychinese/${file}/`)
////////////////////   fs.writeFileSync(`/home/srghma/Desktop/dictionaries/mychinese/${file}.dsl`, cccedicttextual)
//////////////////// }
////////////////////
//////////////////// // makeBKRS('dabkrs_230216')
//////////////////// // makeBKRS('dabruks_230216')
////////////////////
//////////////////// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////
//////////////////// const ankiJson = JSON.parse(fs.readFileSync('./files/anki.json').toString()); null
//////////////////// // const ankiJson = {}
////////////////////
//////////////////// const dict_output_text_purple = R.toPairs(ankiJson).map(([key, { purpleculture_hsk, purpleculture_info, purpleculture_tree, charactersWithComponent, charactersWithComponent_hanziyuan }]) => {
////////////////////   // if (key !== '着') { return }
////////////////////   const process = (text) => {
////////////////////     text = text.replace(/\n+/g, '\n')
////////////////////     text = text.trim()
////////////////////     // console.log('1', text)
////////////////////     text = text.replace(/\<li\>/g, '\n<li>')
////////////////////     text = text.replace(/<\/div><div>/g, '</div>\n<div>')
////////////////////     // text = text.replace(/\n/g, '<br/>')
////////////////////     // console.log('2', text)
////////////////////     text = removeHTML(dom, text)
////////////////////     text = text.replace(/\n+/g, '\n')
////////////////////     text = text.replace(/\n/g, '<br/>')
////////////////////     // console.log('3', text)
////////////////////     return text
////////////////////   }
////////////////////   if (purpleculture_info) { purpleculture_info = process(purpleculture_info) }
////////////////////   if (purpleculture_tree) { purpleculture_tree = process(purpleculture_tree) }
////////////////////
////////////////////   // WHF!!! bc of &??
////////////////////   // const linkTranchinese = x => `<iref href="https://www.trainchinese.com/v2/search.php?searchWord=${encodeURIComponent(x)}&tcLanguage=ru">${x}</iref>`
////////////////////   // const linkTranchinese = x => `<iref href="https://www.trainchinese.com/v2/search.php?searchWord=${encodeURIComponent(x)}">${x}</iref>`
////////////////////   const linkTranchinese = x => `<a href="https://www.trainchinese.com/v2/search.php?searchWord=${encodeURIComponent(x)}">${x}</a>`
////////////////////
////////////////////   let value = [
////////////////////     purpleculture_info                ? `purpleculture_info: ${colorizeHanzi__in_text(purpleculture_info, false)}` : '',
////////////////////     purpleculture_hsk                 ? `purpleculture_hsk: ${purpleculture_hsk}` : '',
////////////////////     purpleculture_tree                ? `purpleculture_tree: ${colorizeHanzi__in_text(purpleculture_tree, false)}` : '',
////////////////////     charactersWithComponent           ? `charactersWithComponent: ${charactersWithComponent.map(x => colorizeHanzi(x, false)).join(", ")}` : '',
////////////////////     charactersWithComponent_hanziyuan ? `charactersWithComponent_hanziyuan: ${charactersWithComponent_hanziyuan.map(x => colorizeHanzi(x, false)).join(", ")}` : '',
////////////////////     `tranchinese: ${linkTranchinese(`${key}*`)}, ${linkTranchinese(`*${key}`)}`
////////////////////   ].filter(x => x).map(x => `<p>${x}</p>`).join('')
////////////////////   // console.log(value)
////////////////////   return `<article><key>${key}</key><definition type="h"><![CDATA[${value}]]></definition></article>`
//////////////////// }).join('\n\n')
////////////////////
//////////////////// fs.writeFileSync(`/tmp/purpleculture-textual.xml`, `<?xml version="1.0" encoding="UTF-8" ?>
//////////////////// <stardict>
//////////////////// <info>
////////////////////   <version>3.0.0</version>
////////////////////   <bookname>srghma purpleculture</bookname>
////////////////////   <author>Serhii Khoma</author>
////////////////////   <email>srghma@gmail.com</email>
////////////////////   <website>srghma-chinese.github.io</website>
////////////////////   <description>MIT copyright</description>
////////////////////   <date>${new Date()}</date>
////////////////////   <dicttype><!-- this element is normally empty --></dicttype>
//////////////////// </info>
//////////////////// <contents>
//////////////////// ${dict_output_text_purple}
//////////////////// </contents>
//////////////////// </stardict>`)
////////////////////
////////////////////
//////////////////// mkStardict("/tmp/purpleculture-textual.xml", "/home/srghma/Desktop/dictionaries/mychinese/purpleculture/")
// mkAard("/tmp/purpleculture-textual.xml", "/home/srghma/Desktop/dictionaries/mychinese/purpleculture.slob")

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function pinyin_numbered_only_letters_and_numbers___make_last_tone_5(pinyin_numbered_only_letters_and_numbers) {
  // return pinyin_numbered_only_letters_and_numbers.replace(/(\d+)(?=\D*$)/, '')
  return pinyin_numbered_only_letters_and_numbers.replace(/\d$/, '')
}

// pinyin_numbered_only_letters_and_numbers___make_last_tone_5('piao4 liang') // should be 'piao4 liang'
// pinyin_numbered_only_letters_and_numbers___make_last_tone_5('piao4 liang2') // should be 'piao4 liang'

const trainchinese_with_cache_path = '/home/srghma/projects/anki-cards-from-pdf/trainchinese_cache.json'
let trainchinese_cache = {}
if (fs.existsSync(trainchinese_with_cache_path)) { trainchinese_cache = JSON.parse(fs.readFileSync(trainchinese_with_cache_path).toString()) }; null

let trainchinese_cache_ = null
trainchinese_cache_ = Object.values(trainchinese_cache).flat().filter(R.identity)
trainchinese_cache_ = R.uniqBy(x => [x.ch.trim(), x.pinyin.trim(), x.transl.trim(), x.type.trim()].flat().join('').replace(/[\s\.]+/ig, ''), trainchinese_cache_)
trainchinese_cache_ = trainchinese_cache_.map(x => ({ ...x, pinyin_numbered: convertPinyin__marked_to_numbered(x.pinyin), pinyin_colored_html: colorPinyin(x.pinyin) }))
trainchinese_cache_ = trainchinese_cache_.map(x => ({ ...x, pinyin_numbered_only_letters_and_numbers: x.pinyin_numbered.toLowerCase().replace(/[^a-z0-9]+/g, '') }))
trainchinese_cache_ = trainchinese_cache_.map(x => ({ ...x, pinyin_numbered_only_letters_and_numbers__last_tone_is_5: pinyin_numbered_only_letters_and_numbers___make_last_tone_5(x.pinyin_numbered_only_letters_and_numbers) }))

const [trainchinese_cache__only_frases, trainchinese_cache__without_frases] = R.partition(x => x.type === 'фраза', trainchinese_cache_)
const [trainchinese_cache__only_idioms, trainchinese_cache__without_frases_and_idioms] = R.partition(x => x.type === 'идиома', trainchinese_cache__without_frases)

// "cheng2 le hong2 se4 ."

const getOmophones = (values) => {
  let output = values.map(({ ch, pinyin_numbered, pinyin_numbered_only_letters_and_numbers, pinyin_numbered_only_letters_and_numbers__last_tone_is_5 }) => {
    if (!ch)                                                       { throw new Error('ch') }
    if (!pinyin_numbered)                                          { throw new Error('pinyin_numbered') }
    if (!pinyin_numbered_only_letters_and_numbers)                 { throw new Error('pinyin_numbered_only_letters_and_numbers') }
    if (!pinyin_numbered_only_letters_and_numbers__last_tone_is_5) { throw new Error('pinyin_numbered_only_letters_and_numbers__last_tone_is_5') }

    const trainchinese_cache___without_current_word = trainchinese_cache_.filter(x => x.ch !== ch)

    const omophones = trainchinese_cache___without_current_word.filter(x => x.pinyin_numbered_only_letters_and_numbers == pinyin_numbered_only_letters_and_numbers)

    const omophones__last_tone_is_5 = pinyin_numbered_only_letters_and_numbers__last_tone_is_5 === pinyin_numbered_only_letters_and_numbers
      ? []
      : trainchinese_cache___without_current_word.filter(x => x.pinyin_numbered_only_letters_and_numbers === pinyin_numbered_only_letters_and_numbers__last_tone_is_5)

    return [
      { id: pinyin_numbered_only_letters_and_numbers, omophones: omophones },
      { id: pinyin_numbered_only_letters_and_numbers, omophones: omophones__last_tone_is_5 }
    ]
  })
  output = output.flat().filter(x => x.omophones.length > 0)

  if (output.length === 1) {
    return { 'omophones': output[0].omophones }
  }

  if (output.length === 2) {
    return { 'omophones': output[0].omophones, 'omophones5': output[1].omophones }
  }

  return R.fromPairs(output.map(({ id, omophones }) => [`omophones ${id}`, omophones]))
}

// R.uniq(trainchinese_cache_.map(x => x.type).map(x => x.split('/')).flat())

const colorizeType = (type) => {
  let type_ = type.split('/')
  type_ = type_.map(x => {
    const color = {
      'прил':                  'cyan',
      'сущ':                   'orange',
      'глаг':                  'red',
      'фраза':                 'green',
      'фраза со знач. сущ':    'green',
      'идиома':                'green',
      'графема':               'green',
      'ключ':                  'green',
      'нареч':                 'green',
      'сч.слово':              'green',
      'местоим':               'green',
      'Раздельно-слитные сл.': 'green',
      'частица':               'green',
      'вспом.сл.':             'orange',
      'предлог':               'green',
      'союз':                  'green',
      'мод.глаг':              'red',
      'междом':                'green',
      'звукоподр':             'green',
      'число':                 'green',
      'pron.':                 'green'
    }[x]

    if (!color) { throw new Error(`no color for ${x}`) }

    return `<font color="${color}">${escapeHTML(x)}</font>`
  })
  return type_.join(escapeHTML('/'))
}

const printTrainChineseRow = withCh => ({ ch, pinyin_colored_html, transl, type }) => {
  return [
    // withCh ? ch : null,
    withCh ? `<span>${colorizeHanzi__in_text(ch)}</span>` : null,
    colorizeType(type),
    pinyin_colored_html,
    escapeHTML(transl),
  ].filter(x => x).join(escapeHTML(' | '))
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const trainchinese_ch_word_to_ru__textual__writer = fs.createWriteStream(`/tmp/trainchinese-ch_word_to_ru__textual.xml`)
trainchinese_ch_word_to_ru__textual__writer.on('error', err => console.error(err))
trainchinese_ch_word_to_ru__textual__writer.on('open', async function() {
  await writeWithAwait(trainchinese_ch_word_to_ru__textual__writer, `<?xml version="1.0" encoding="UTF-8" ?>
  <stardict>
  <info>
    <version>3.0.0</version>
    <bookname>srghma trainchinese ch word to ru</bookname>
    <author>Serhii Khoma</author>
    <email>srghma@gmail.com</email>
    <website>srghma-chinese.github.io</website>
    <description>MIT copyright</description>
    <date>${new Date()}</date>
    <dicttype><!-- this element is normally empty --></dicttype>
  </info>
  <contents>`)

  let trainchinese_cache__without_frases_and_idioms__words = trainchinese_cache__without_frases_and_idioms.filter(x => x.ch.length !== 1)
  trainchinese_cache__without_frases_and_idioms__words = R.groupBy(R.prop('ch'), trainchinese_cache__without_frases_and_idioms__words)

  for await (const [key, value] of R.toPairs(trainchinese_cache__without_frases_and_idioms__words)) {
    let trainchinese_cache_current = trainchinese_cache__without_frases_and_idioms.filter(({ ch }) => ch !== key && ch.includes(key))

    const getByRegex = r => {
      const [matches, doesntmatch] = R.partition(s => (new RegExp(r)).test(s.ch), trainchinese_cache_current)
      trainchinese_cache_current = doesntmatch
      // return matches
      return R.sortBy(x => x.pinyin_numbered, matches)
    }

    const exes = key.split('').map(() => 'x').join('')

    let rendering = {
      ' ': value,

      ...getOmophones(value),

      [`${exes}.`]: getByRegex(`^${key}.$`),
      [`.${exes}`]: getByRegex(`^.${key}$`),

      [`${exes}..`]: getByRegex(`^${key}..$`),
      [`.${exes}.`]: getByRegex(`^.${key}.$`),
      [`..${exes}`]: getByRegex(`^..${key}$`),

      [`${exes}...`]: getByRegex(`^${key}...$`),
      [`.${exes}..`]: getByRegex(`^.${key}..$`),
      [`..${exes}.`]: getByRegex(`^..${key}.$`),
      [`...${exes}`]: getByRegex(`^...${key}$`),

      [`${exes}....`]: getByRegex(`^${key}....$`),
      [`.${exes}...`]: getByRegex(`^.${key}...$`),
      [`..${exes}..`]: getByRegex(`^..${key}..$`),
      [`...${exes}.`]: getByRegex(`^...${key}.$`),
      [`....${exes}`]: getByRegex(`^....${key}$`),

      [`${exes}.....`]: getByRegex(`^${key}.....$`),
      [`.${exes}....`]: getByRegex(`^.${key}....$`),
      [`..${exes}...`]: getByRegex(`^..${key}...$`),
      [`...${exes}..`]: getByRegex(`^...${key}..$`),
      [`....${exes}.`]: getByRegex(`^....${key}.$`),
      [`.....${exes}`]: getByRegex(`^.....${key}$`),

      [`${exes}*`]:    getByRegex(`^${key}`),
      // `*${exes}`:    getByRegex(`${key}$`),
      'other': getByRegex(`.`),

      'idioms': trainchinese_cache__only_idioms.filter(({ ch }) => ch.includes(key)),
      'frases': trainchinese_cache__only_frases.filter(({ ch }) => ch.includes(key)),
    }

    rendering = R.toPairs(rendering).filter(([k, v]) => v.length > 0)

    rendering = rendering.map(([k, v]) => {
      return [
        k.trim() ? `<hr/><big>${k}</big>` : null,
        ...(R.uniq(v.map(printTrainChineseRow(!!k.trim()))))
      ]
    }).flat().filter(x => x).join('<br/>')
    // console.log(rendering)

    if (rendering.length > 0) {
      await writeWithAwait(trainchinese_ch_word_to_ru__textual__writer, `<article><key>${key}</key><definition type="h"><![CDATA[${rendering}]]></definition></article>\n\n`)
    }
  }

  await writeWithAwait(trainchinese_ch_word_to_ru__textual__writer, `</contents></stardict>`)
  trainchinese_ch_word_to_ru__textual__writer.end()
  const maybeFinishError = await finishedAwait(trainchinese_ch_word_to_ru__textual__writer)
  if (maybeFinishError) {
    console.error('Stream failed.', maybeFinishError)
    return
  }
  console.log('Stream is finished.');

  mkStardict("/tmp/trainchinese-ch_word_to_ru__textual.xml", "/home/srghma/Desktop/dictionaries/mychinese/trainchinese_ch_word_to_ru/")
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const alltrainchinese__hierogliphs = R.uniq([...trainchinese_cache__without_frases_and_idioms.map(x => x.ch).join('')]).filter(isHanzi)

const trainchinese_ch_ierogliph_to_ru_textual__writer = fs.createWriteStream(`/tmp/trainchinese_ch_ierogliph_to_ru-textual.xml`)
trainchinese_ch_ierogliph_to_ru_textual__writer.on('error', err => console.error(err))
trainchinese_ch_ierogliph_to_ru_textual__writer.on('open', async function() {
  await writeWithAwait(trainchinese_ch_ierogliph_to_ru_textual__writer, `<?xml version="1.0" encoding="UTF-8" ?>
  <stardict>
  <info>
    <version>3.0.0</version>
    <bookname>srghma trainchinese ch ierogliph to ru</bookname>
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
    let trainchinese_cache_current = trainchinese_cache__without_frases_and_idioms.filter(({ ch }) => ch.includes(key))

    const getByRegex = r => {
      const [matches, doesntmatch] = R.partition(s => (new RegExp(r)).test(s.ch), trainchinese_cache_current)
      trainchinese_cache_current = doesntmatch
      // return matches
      return R.sortBy(x => x.pinyin_numbered, matches)
    }

    let value = {
      ' ': getByRegex(`^${key}$`),

      'x.': getByRegex(`^${key}.$`),
      '.x': getByRegex(`^.${key}$`),

      'x..': getByRegex(`^${key}..$`),
      '.x.': getByRegex(`^.${key}.$`),
      '..x': getByRegex(`^..${key}$`),

      'x...': getByRegex(`^${key}...$`),
      '.x..': getByRegex(`^.${key}..$`),
      '..x.': getByRegex(`^..${key}.$`),
      '...x': getByRegex(`^...${key}$`),

      'x....': getByRegex(`^${key}....$`),
      '.x...': getByRegex(`^.${key}...$`),
      '..x..': getByRegex(`^..${key}..$`),
      '...x.': getByRegex(`^...${key}.$`),
      '....x': getByRegex(`^....${key}$`),

      'x.....': getByRegex(`^${key}.....$`),
      '.x....': getByRegex(`^.${key}....$`),
      '..x...': getByRegex(`^..${key}...$`),
      '...x..': getByRegex(`^...${key}..$`),
      '....x.': getByRegex(`^....${key}.$`),
      '.....x': getByRegex(`^.....${key}$`),

      'x*':    getByRegex(`^${key}`),
      // '*x':    getByRegex(`${key}$`),
      'other': getByRegex(`.`),
    }

    value = R.toPairs(value).filter(([k, v]) => v.length > 0)

    value = value.map(([k, v]) => {
      return [
        k.trim() ? `<hr/><big>${k}</big>` : null,
        ...(R.uniq(v.map(printTrainChineseRow(!!k.trim()))))
      ]
    }).flat().filter(x => x).join('<br/>')
    // console.log(value)

    if (value.length > 0) {
      await writeWithAwait(trainchinese_ch_ierogliph_to_ru_textual__writer, `<article><key>${key}</key><definition type="h"><![CDATA[${value}]]></definition></article>\n\n`)
    }
  }

  await writeWithAwait(trainchinese_ch_ierogliph_to_ru_textual__writer, `</contents></stardict>`)
  trainchinese_ch_ierogliph_to_ru_textual__writer.end()
  const maybeFinishError = await finishedAwait(trainchinese_ch_ierogliph_to_ru_textual__writer)
  if (maybeFinishError) {
    console.error('Stream failed.', maybeFinishError)
    return
  }
  console.log('Stream is finished.');

  mkStardict("/tmp/trainchinese_ch_ierogliph_to_ru-textual.xml", "/home/srghma/Desktop/dictionaries/mychinese/trainchinese_ch_ierogliph_to_ru/")
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const conjuctionRegexes = "или, либо, и, а, но, да, если, что, когда, потому что, так как, как будто, вследствие того что, с тех пор как, в то время как, для того чтобы".split(",").map(x => {
  const regexText = ` ${x.trim()} `.replace(/\s/g, "[,;\\.:\"\\s]")
  const regex = new RegExp(regexText, "g")
  // console.log(regexText, regex)
  return regex
})

function rutranslation_splitOnWords(text) {
  text = text.toLowerCase()
  text = [...text].filter(x => !isHanzi(x)).join('')

  text = text.replace(/ё/g, 'е')
  // text = text.replace(/e/g, 'е') // eng to ru

  text = text.replace(/^\([^\)]+\)/g, ', ')
  text = text.replace(/([,;]\s*)\([^\)]+\)/g, '$1') // , (...)

  text = text.replace(/\([^\)]+\)$/g, ',')
  text = text.replace(/\([^\)]+\)(\s*[,;])/g, '$1') // (...),

  let text_1 = text
  conjuctionRegexes.map(x => { text_1 = text_1.replace(x, ' , ') })
  text_1 = text_1.replace(/\(обр\.\)/g, ',')
  text_1 = text_1.replace(/так([^,]*), как/g, 'так$1 как')
  text_1 = text_1.split(/[,;\.:\s\"\(\)]/g)
  text_1 = text_1.map(x => x.trim()).filter(x => x).filter(x => !x.startsWith('см.'))

  let text_2 = text.replace(/так([^,]*), как/g, 'так$1 как')
  text_2 = text_2.split(/[,;\.:\"]/g)
  text_2 = text_2.map(x => x.trim()).filter(x => x).filter(x => !x.startsWith('см.'))

  return R.uniq([...text_1, ...text_2])
}
rutranslation_splitOnWords('привлекающий внимание, яркий и живой; ясноглазый (исп. невидящим человеком по отношению к людям, которые могут видеть); (обр.) способный замечать или видеть вещи такими, какие они есть')
rutranslation_splitOnWords('(о голосе) звонкий, светить(ся)')

let trainchinese_cache__ = trainchinese_cache__without_frases_and_idioms.map(x => ({ ...x, transl__splitted: rutranslation_splitOnWords(x.transl) }))
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
        // ch,
        `<span>${colorizeHanzi__in_text(ch)}</span>`,
        colorizeType(type),
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

/////////////////// mkCCCEDICTToTextual("/home/srghma/Downloads/cedict_1_0_ts_utf-8_mdbg/cedict_ts.u8", "/tmp/cc-cedict-textual.xml")
///////////////////
/////////////////// let cccedicttextual = fs.readFileSync("/tmp/cc-cedict-textual.xml").toString()
///////////////////
/////////////////// // cccedicttextual = '<article>\n' +
/////////////////// // '<key>88</key>\n' +
/////////////////// // '<synonym>ba1 ba1</synonym>\n' +
/////////////////// // '<synonym>bye-bye</synonym>\n' +
/////////////////// // '<definition type="h"><![CDATA[<div style="border: 1px solid"><div><big><div style="display: inline-block"><font color="cornflowerblue">8</font><font color="cornflowerblue">8</font></div></big><br><big><div style="display: inline-block"><font color="cornflowerblue">bā</font><font color="cornflowerblue">bā</font></div></big></div><div><ul><li>(Internet slang) bye-bye (alternative for 拜拜[bai2 bai2])</li></ul></div></div>]]></definition>\n' +
/////////////////// // '</article>'
///////////////////
/////////////////// cccedicttextual = cccedicttextual.replace(/; padding: 5px/g,      '')
/////////////////// cccedicttextual = cccedicttextual.replace(/font color="red"/g,    `font color="${getTone(1)}"`)
/////////////////// cccedicttextual = cccedicttextual.replace(/font color="orange"/g, `font color="${getTone(2)}"`)
/////////////////// cccedicttextual = cccedicttextual.replace(/font color="green"/g,  `font color="${getTone(3)}"`)
/////////////////// cccedicttextual = cccedicttextual.replace(/font color="blue"/g,   `font color="${getTone(4)}"`)
/////////////////// cccedicttextual = cccedicttextual.replace(/font color="black"/g,  `font color="${getTone(5)}"`)
/////////////////// cccedicttextual = cccedicttextual.replaceAll(/(CDATA\[.*<\/big>)([^\n]+)/g,  (match, p1, p2) => {
///////////////////   // console.log({ p1, p2 })
///////////////////   return p1 + colorPinyin(colorizeHanzi__in_text(p2)).replace(/\[/g, ' [')
/////////////////// })
///////////////////
/////////////////// fs.writeFileSync("/tmp/cc-cedict-textual.xml", cccedicttextual)
/////////////////// mkStardict("/tmp/cc-cedict-textual.xml", "/home/srghma/Desktop/dictionaries/mychinese/cc-cedict/")

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
