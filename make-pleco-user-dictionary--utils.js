const R = require('ramda')
const { finished } = require('node:stream')
const { once } = require('events')
const pinyinUtils = require('pinyin-utils')
const pinyinSplit = require('pinyin-split')

const hanzijs = require("hanzi");
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


const mkStardict = (input, output) => require("child_process").execSync(`export INPUT="${input}" && export OUTPUT="${output}" && rm -rfd "$OUTPUT" && mkdir -p "$OUTPUT" && cd ~/projects/pyglossary && nix-shell -p pkgs.gobject-introspection python38Packages.pygobject3 python38Packages.pycairo python38Packages.prompt_toolkit python38Packages.lxml python38Packages.PyICU pkgs.dict --run 'python3 main.py --ui=cmd "$INPUT" "$OUTPUT" --utf8-check --read-format=StardictTextual --write-format=Stardict'`)

const mkAard = (input, output) => require("child_process").execSync(`export INPUT="${input}" && export OUTPUT="${output}" && rm -rf "$OUTPUT" && cd ~/projects/pyglossary && nix-shell -p pkgs.gobject-introspection python38Packages.pygobject3 python38Packages.pycairo python38Packages.prompt_toolkit python38Packages.lxml python38Packages.PyICU pkgs.dict --run 'python3 main.py --ui=cmd "$INPUT" "$OUTPUT" --utf8-check --read-format=StardictTextual --write-format=Aard2Slob'`)

const mkCCCEDICTToTextual = (input, output) => require("child_process").execSync(`export INPUT="${input}" && export OUTPUT="${output}" && rm -rf "$OUTPUT" && cd ~/projects/pyglossary && nix-shell -p pkgs.gobject-introspection python38Packages.pygobject3 python38Packages.pycairo python38Packages.prompt_toolkit python38Packages.lxml python38Packages.PyICU pkgs.dict --run 'python3 main.py --ui=cmd "$INPUT" "$OUTPUT" --utf8-check --read-format=CC-CEDICT --write-format=StardictTextual'`)

exports.convertPinyin__marked_to_numbered = convertPinyin__marked_to_numbered
exports.writeWithAwait                    = writeWithAwait
exports.finishedAwait                     = finishedAwait
exports.getTone                           = getTone
exports.colorizeHanzi                     = colorizeHanzi
exports.colorizeHanzi__in_text            = colorizeHanzi__in_text
exports.escapeHTML                        = escapeHTML
exports.colorPinyin                       = colorPinyin
exports.removeLinks                       = removeLinks
exports.ruPinyinTextToArray               = ruPinyinTextToArray
exports.getDuplicatedItems                = getDuplicatedItems
exports.throwIfDuplicate                  = throwIfDuplicate
exports.mkStardict                        = mkStardict
exports.mkAard                            = mkAard
exports.mkCCCEDICTToTextual               = mkCCCEDICTToTextual
