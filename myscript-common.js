const unknownHanzi = new Set([])

var isBrowser = (function() {
  try {
    return this === window;
  } catch (e) {
    return false;
  }
})();

// google-chrome-beta --user-data-dir="/tmp/tmp-chrome-user-data-dir" --allow-file-access-from-files file:///home/srghma/projects/srghma-chinese/elon-musk/unknown-hanzi.html --disable-web-security
const isFileSystem = isBrowser && window.location.protocol === "file:"
const mychineseSitePrefix__root = isFileSystem ? "file:///home/srghma/projects/srghma-chinese" : ""
const mychineseSitePrefix__elon_musk = isFileSystem ? "file:///home/srghma/projects/srghma-chinese/elon-musk/" : "/elon-musk/"
const isGithubPage = isBrowser && /srghma-chinese\d*\.github\.io/.test(window.location.host)

const rootUrl__srghmaChineseFiles__collectionMedia = isFileSystem ? `file:///home/srghma/projects/srghma-chinese-files/collection.media` : `https://srghma-chinese-files.github.io/collection.media`

const {
  ruPinyinTextPromise__file_url,
  hanziAnkiInfoPromise__file_url,
  allHanziAnkiInfoPromise__file_url
} = (function() {
  if (isFileSystem) {
    return {
      ruPinyinTextPromise__file_url:     () =>      `${mychineseSitePrefix__root}/ru-pinyin.txt`,
      hanziAnkiInfoPromise__file_url:    (hanzi) => `${mychineseSitePrefix__root}/files-split/${hanzi}.json`,
      allHanziAnkiInfoPromise__file_url: () =>      `${mychineseSitePrefix__root}/files/anki.json`
    }
  } else if (isGithubPage) {
    // https://github.com/USER/PROJECT/blob/gh-pages/PATH_TO_FILE?raw=true
    // return `https://github.com/${window.location.host.replace('.github.io', '')}/${window.location.host}/blob/master/ru-pinyin.txt?raw=true`
    // https://github.com/${window.location.host.replace('.github.io', '')}/${window.location.host}/raw/master/ru-pinyin.txt
    const mychineseSitePrefix__root = `https://raw.githubusercontent.com/${window.location.host.replace('.github.io', '')}/${window.location.host}/main/`

    return {
      ruPinyinTextPromise__file_url:     () =>      `${mychineseSitePrefix__root}/ru-pinyin.txt`,
      hanziAnkiInfoPromise__file_url:    (hanzi) => `${mychineseSitePrefix__root}/files-split/${hanzi}.json`,
      allHanziAnkiInfoPromise__file_url: () =>      `${mychineseSitePrefix__root}/files/anki.json`
    }
  } else {
    // serve .
    // localhost:5000
    return {
      ruPinyinTextPromise__file_url:     () =>      `${mychineseSitePrefix__root}/ru-pinyin.txt`,
      hanziAnkiInfoPromise__file_url:    (hanzi) => `${mychineseSitePrefix__root}/files-split/${hanzi}.json`,
      allHanziAnkiInfoPromise__file_url: () =>      `${mychineseSitePrefix__root}/files/anki.json`
    }
  }
})();

const isCurrentPageAHPage = (function() {
  if (!isBrowser) { return false }
  let x = window.location.pathname.split('/')
  x = x[x.length - 1]
  x = x.replace('.html', '')
  return x === "h"
})();

//////////////////////////////////////////

function sortBy(fn, list) {
  return Array.prototype.slice.call(list, 0).sort(function(a, b) {
    var aa = fn(a);
    var bb = fn(b);
    return aa < bb ? -1 : aa > bb ? 1 : 0;
  });
}

//////////////////////////////////////////

// Object -> Set
function mk_ruPinyinObject_small(ruPinyinObject) {
  const buffer = new Set()
  for (const [key, value] of Object.entries(ruPinyinObject)) {
    if (value.length < 10 || value.includes("TODOFINISH")) {
      buffer.add(key)
    }
  }
  return buffer
}

//////////////////////////////////////////

function ruPinyinTextToArray(text) {
  return text.split(/―{4,}|-{4,}/).map(x => x.trim())
}

const removeLinks = x => x.replace(/<link>[^<]*<\/link>/g, '')

const ruPinyinTextPromise = () => fetch(ruPinyinTextPromise__file_url()).then(x => x.text())
const hanziAnkiInfoPromise = (hanzi) => fetch(hanziAnkiInfoPromise__file_url(hanzi)).then(x => x.json())
const allHanziAnkiInfoPromise = () => fetch(allHanziAnkiInfoPromise__file_url()).then(x => x.json())

const asyncLoadAllAnkiInfoAndText = async (hanzi) => {
  const [allHanziAnkiInfo, ruPinyinText] = await Promise.all([
    allHanziAnkiInfoPromise(),
    ruPinyinTextPromise(),
  ])
  return { allHanziAnkiInfo, ruPinyinText }
}

const asyncLoadHanziAnkiInfoAndText = async (hanzi) => {
  const [hanziAnkiInfo, ruPinyinText] = await Promise.all([
    hanziAnkiInfoPromise(hanzi),
    ruPinyinTextPromise(),
  ])
  return { hanziAnkiInfo, ruPinyinText }
}

const asyncLoadHanziAnkiInfoAndAllAnkiInfoAndText = async (hanzi) => {
  let allHanziAnkiInfo
  let hanziAnkiInfo
  let ruPinyinText

  if (isGithubPage) {
    const result = await asyncLoadHanziAnkiInfoAndText(hanzi)
    hanziAnkiInfo = result.hanziAnkiInfo
    ruPinyinText = result.ruPinyinText
    allHanziAnkiInfo = { [hanzi]: hanziAnkiInfo }
  } else {
    const result = await asyncLoadAllAnkiInfoAndText()
    allHanziAnkiInfo = result.allHanziAnkiInfo
    ruPinyinText = result.ruPinyinText
    hanziAnkiInfo = allHanziAnkiInfo[hanzi]
  }

  return { allHanziAnkiInfo, hanziAnkiInfo, ruPinyinText }
}

function recomputeCacheAndThrowIfDuplicate(ruPinyinArray) {
  const arrayOfValuesToObject = ({ arrayOfKeysField, valueField, array }) => {
    const buffer = {}
    const duplicateKeys = {}

    function duplicateKeys_add(hanziThatIsDuplicated, duplicatedWhere) {
      if (duplicateKeys.hasOwnProperty(hanziThatIsDuplicated)) {
        duplicateKeys[hanziThatIsDuplicated].push(duplicatedWhere)
      } else {
        duplicateKeys[hanziThatIsDuplicated] = [duplicatedWhere]
      }
    }

    array.forEach(arrayElement => {
      arrayElement[arrayOfKeysField].forEach(key => {
        if (buffer.hasOwnProperty(key)) { duplicateKeys_add(key, arrayElement[valueField]) }
        buffer[key] = arrayElement[valueField]
      })
    })

    if (Object.keys(duplicateKeys).length > 0) { throw new Error(`duplicateKeys: ${JSON.stringify(duplicateKeys, undefined, 2)}`) }

    return buffer
  }

  ruPinyinArray = ruPinyinArray.map(text => {
    const hanzi = uniq([...(removeLinks(text))].filter(isHanzi))

    return {
      text,
      hanzi,
    }
  })

  // console.log(ruPinyinArray)

  return arrayOfValuesToObject({
    arrayOfKeysField: "hanzi",
    valueField: "text",
    array: ruPinyinArray,
  })
}

/////////////////////////////////

const REGEX_JAPANESE = /[\u3040-\u309f]|[\u30a0-\u30ff]|[\u4e00-\u9faf]|[\u3400-\u4dbf]/
const REGEX_CHINESE = /[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/;

const specialChar = "。？！，"
// Hiragana: [\u3040-\u309f]
// Katakana: [\u30a0-\u30ff]
// Roman characters + half-width katakana: [\uff00-\uff9f]
// Roman characters + half-width katakana (more): [\uff00-\uffef]
// Kanji: [\u4e00-\u9faf]|[\u3400-\u4dbf]

function isHanzi(ch) {
  if ([...ch].length !== 1) { throw new Error(`'${ch}' is not length 1`) }
  const isSpecialChar = specialChar.includes(ch)
  const isJapanese = REGEX_JAPANESE.test(ch)
  const isChinese = REGEX_CHINESE.test(ch)
  const isHanzi = !isSpecialChar && (isJapanese || isChinese)
  return isHanzi
}

/////////////////////////////////

const uniq = array => [...new Set(array)]

function showText(containerElement, text) {
  // console.log(text)

  text = text.replace(/(.)">yw11<\/a>/g, '$1">yw11</a> | <a href="https://zi.tools/zi/$1">zitools</a> | <a href="https://bkrs.info/slovo.php?ch=$1">bkrs</a>')

  if (isFileSystem) {
    text = text.replace(/<img src=("|')(?!https?\:\/\/)/g, '<img src=$1file:///home/srghma/projects/srghma-chinese-files/collection.media/')
    text = text.replace(/href="([^\.]+)\.mp3"/g, 'href="file:///home/srghma/projects/srghma-chinese-files/collection.media/$1.mp3"')

    text = text.replace(/<object data="[^"]+" type="image\/png">/g, '')
    text = text.replace(/<\/object>/g, '')

    text = text.replace('<a href="https://images.yw11.com/zixing/', '<a href="https://lens.google.com/uploadbyurl?url=https://images.yw11.com/zixing/')
  } else if (isGithubPage) {
    // <img src="https://www.unicode.org/cgi-bin/refglyph?24-5DE5"
    // <img src="asdfasdf.png"
    // <img src="hanziyan-J11022.png"/>
    // <img src='lf_24037.gif">
    // https://github.com/srghma-chinese-files/srghma-chinese-files.github.io/blob/master/PATH_TO_FILE?raw=true
    text = text.replace(/<img src=("|')(?!https?\:\/\/)/g, '<img src=$1https://srghma-chinese-files.github.io/collection.media/')
    // href="allsetlearning-gong1.mp3"
    text = text.replace(/href="([^\.]+)\.mp3"/g, 'href="https://srghma-chinese-files.github.io/collection.media/$1.mp3"')
  } else {
    text = text.replace(/<img src=("|')(?!https?\:\/\/)/g, '<img src=$1srghma-chinese-files/collection.media/')
    text = text.replace(/href="([^\.]+)\.mp3"/g, 'href="srghma-chinese-files/collection.media/$1.mp3"')
  }

  containerElement.innerHTML = text

  function enhanceWithLinkToH(containerElement) {
    // const colorizer = (ch, colorIndex) => `<a target="_blank" href="plecoapi://x-callback-url/s?q=${ch}">${ch}</a>`
    const colorizer = (ch, colorIndex) => `<a target="_blank" href="h.html#${ch}">${ch}</a>`
    // const colorizer = (ch, colorIndex) => `<div onclick="window.copyToClipboard('${ch}')">${ch}</div>`
    const ruby_chars = [...containerElement.innerHTML]
    containerElement.innerHTML = ruby_chars.map(ch => isHanzi(ch) ? colorizer(ch) : ch).join('')
  }

  Array.from(document.querySelectorAll('[data-enhance-with-pleco]')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#chinese_opposite')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#ch_with_same_pronounciation')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#Ru_trainchinese')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#origin_of_ch_char_book')).forEach(enhanceWithLinkToH)
  // Array.from(document.querySelectorAll('#rtega_mnemonic')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#purpleculture_info')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#purpleculture_tree')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#purpleculture_examples')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#myStory')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#heisig_constituent')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#humanum_small_description')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#humanum_small_description_en')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#humanum_full_description')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#humanum_full_description_en')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#baidu_chinese')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#baidu_chinese_en')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#hanziyuan')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#yw11')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#yw11_en_transl')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#yw11_image_chinese')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#yw11_image_ru_transl')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#bkrs_pinyin')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#bkrs_transl')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('.my-pinyin-english')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('.my-pinyin-ru')).forEach(enhanceWithLinkToH)
  // Array.from(document.querySelectorAll('.dictips')).forEach(enhanceWithLinkToH)
  // Array.from(document.querySelectorAll('.yw11_image__container')).forEach(enhanceWithLinkToH)
  // Array.from(document.querySelectorAll('.trainchinese-transl')).forEach(enhanceWithLinkToH)

  ///////////////////////////////////

  const elementsToAddTranslLinks = [
    document.getElementById("yw11"),
    document.getElementById("yw11_image_chinese"),
    document.getElementById("baidu_chinese"),
    document.getElementById("humanum_full_description"),
    document.getElementById("humanum_small_description"),
  ]

  // console.log('doing', elementsToAddTranslLinks)

  elementsToAddTranslLinks.filter(x => x).forEach(element => {
    const text = element.innerText.replace(/\n\n+/g, '\n\n').trim()
    // console.log(element, text)
    if (!text) { return }
    const encoded = encodeURIComponent(text)
    const baidu_url = `https://fanyi.baidu.com/#zh/en/` + encoded
    const deepl_url = `https://www.deepl.com/translator#zh/ru/` + encoded

    const link = (text, url) => `<a href="${url}" target="_blank">${text}</a>`
    const linksElement = document.createElement('div')
    linksElement.innerHTML = `${link('baidu', baidu_url)}, ${link('deepl', deepl_url)}`

    element.appendChild(linksElement)
  })
}

function strip(html) {
  let returnText = html

  //-- remove BR tags and replace them with line break
  returnText=returnText.replace(/<br>/gi, "\n");
  returnText=returnText.replace(/<br\s\/>/gi, "\n");
  returnText=returnText.replace(/<br\/>/gi, "\n");

  //-- remove P and A tags but preserve what's inside of them
  returnText=returnText.replace(/<p.*>/gi, "\n");
  returnText=returnText.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, " $2 ($1)");

  //-- remove all inside SCRIPT and STYLE tags
  returnText=returnText.replace(/<script.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/script>/gi, "");
  returnText=returnText.replace(/<style.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/style>/gi, "");
  //-- remove all else
  returnText=returnText.replace(/<(?:.|\s)*?>/g, "");

  //-- get rid of more than 2 multiple line breaks:
  returnText=returnText.replace(/(?:(?:\r\n|\r|\n)\s*){2,}/gim, "\n\n");

  //-- get rid of more than 2 spaces:
  returnText = returnText.replace(/ +(?= )/g,'');

  //-- get rid of html-encoded characters:
  returnText=returnText.replace(/&nbsp;/gi," ");
  returnText=returnText.replace(/&amp;/gi,"&");
  returnText=returnText.replace(/&quot;/gi,'"');
  returnText=returnText.replace(/&lt;/gi,'<');
  returnText=returnText.replace(/&gt;/gi,'>');
  returnText=returnText.replace(/^\s+/gm,'');
  return returnText
}

function showDummyAnkiInfo__getOtherKanjiFromRendered(rendered) {
  // ... -> Array String
  function matchAllFirstMatch(input, regex) {
    return Array.from(input.matchAll(regex)).map(x => x[1])
  }

  function parseHtmlEntities(str) {
    var txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  }

  rendered = parseHtmlEntities(rendered)

  let otherKanji = [
    matchAllFirstMatch(rendered, /Traditional in your browser[^:]+:<\/b><span class="text-lg">(.+?)<\/span>/g),
    matchAllFirstMatch(rendered, /Older traditional characters[^:]+:<\/b><span class="text-lg">(.+?)<\/span>/g),
    matchAllFirstMatch(rendered, /Variant rule[^:]+:(.+?)<\/p>/g),
  ].flat().join('')

  otherKanji = [...otherKanji].filter(isHanzi)
  otherKanji = uniq(otherKanji)
  return otherKanji
}

function showDummyAnkiInfo({ allHanziAnkiInfo, hanzi }) {
  const hanziAnkiInfo = allHanziAnkiInfo[hanzi]

  if (!hanziAnkiInfo) { return hanzi }

  const otherKanji = showDummyAnkiInfo__getOtherKanjiFromRendered(hanziAnkiInfo.rendered).filter(x => x !== hanziAnkiInfo.kanji)

  let mainAndOtherKanji_kanji_and_glyphPronunciations = [hanzi, ...otherKanji].map(hanzi => {
    const hanziAnkiInfo = allHanziAnkiInfo[hanzi]

    if (!hanziAnkiInfo) { return hanzi }

    let glyphs = (hanziAnkiInfo.glyphs || []).map(x => (x.pinyins || [])[0]).filter(x => x).join(' + ')
    return [hanziAnkiInfo.kanji, glyphs].filter(x => x).join(' ')
  }).filter(x => x).join('\n')

  let Ru_trainchinese = hanziAnkiInfo.Ru_trainchinese || ""
  // console.log(Ru_trainchinese)
  Ru_trainchinese = strip(Ru_trainchinese)
  // console.log(Ru_trainchinese)

  Ru_trainchinese = Ru_trainchinese.replace(/^(.+?): \(.+?\)/gm, '$1')
  Ru_trainchinese = Ru_trainchinese.replace(/\(диал\.\)/g, '')
  Ru_trainchinese = Ru_trainchinese.replace(/\(книжн\.\)/g, '')

  // console.log(Ru_trainchinese)
  // console.log(strip(Ru_trainchinese))
  return [mainAndOtherKanji_kanji_and_glyphPronunciations, Ru_trainchinese].filter(x => x).join('\n') + '\n'
}

if (!isBrowser) {
  exports.ruPinyinTextToArray = ruPinyinTextToArray
  exports.recomputeCacheAndThrowIfDuplicate = recomputeCacheAndThrowIfDuplicate
  exports.mk_ruPinyinObject_small = mk_ruPinyinObject_small
}

///////////////////////////////////

// Copyright (c) 2020, Pepe Becker

// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.

// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

/**
 * Create a unicode character from the codepoint of a Chinese character
 * @param codepoint codepoint of Chinese character as number or string type
 * @example
 * ```
 * codepointToUnicode(0x6211)   // 我
 * codepointToUnicode('0x6211') // 我
 * codepointToUnicode('U+6211') // 我
 * codepointToUnicode('6211')   // 我
 * ```
 */
const codepointToUnicode = (codepoint) => {
    if (typeof codepoint === 'string') {
        let codepointStr = codepoint.replace('U+', '');
        if (!/^0x/.test(codepointStr)) {
            codepointStr = '0x' + codepointStr;
        }
        return String.fromCodePoint(parseInt(codepointStr));
    }
    return String.fromCodePoint(codepoint);
};
/**
 * Four tones: ` ̄` ` ́` ` ̌` ` ̀`
 */
const toneMarks = ['\u0304', '\u0301', '\u030c', '\u0300'];
/**
 * Returns the tone number of a Pinyin syllable
 * @param text Pinyin syllable to get the tone number from
 * @example
 * ```
 * getToneNumber('shì')  // 4
 * getToneNumber('shi4') // 4
 * ```
 */
const getToneNumber = (text) => {
    // Check for tone number
    const matches = text.match(/[a-zü](\d)/i);
    if (matches)
        return +matches[1];
    // Check for tone mark
    for (let i = 0; i < toneMarks.length; i++) {
        if (text.normalize('NFD').match(toneMarks[i]))
            return i + 1;
    }
    // Return 5th tone as default
    return 5;
};
/**
 * Removes the tone mark/number from a Pinyin syllable
 * @param text Pinyin syllable to remove the tone mark/number from
 * @example
 * ```
 * removeTone('wǒ')  // wo
 * removeTone('wo3') // wo
 * ```
 */
const removeTone = (text) => {
    text = text.normalize('NFD').replace(/\u0304|\u0301|\u030c|\u0300/g, '');
    return text.normalize('NFC').replace(/(\w|ü)[1-5]/gi, '$1');
};
function markToNumber(data, fithTone = true) {
    const process = (text) => {
        if (text.trim().length === 0)
            return text;
        if (fithTone) {
            return removeTone(text) + getToneNumber(text);
        }
        else {
            const tone = getToneNumber(text);
            return tone === 5 ? removeTone(text) : removeTone(text) + tone;
        }
    };
    if (Array.isArray(data)) {
        return data.map(process);
    }
    else {
        return process(data);
    }
}
function numberToMark(data) {
    const process = (text) => {
        if (text.trim().length === 0)
            return text;
        const tone = getToneNumber(text);
        text = removeTone(text);
        if (tone !== 5) {
            if (text === 'm' || text === 'n' || text === 'M' || text === 'N') {
                return (text + toneMarks[tone - 1]).normalize('NFC');
            }
            const matchedVovels = text.match(/[aeiouü]/gi);
            if (matchedVovels) {
                let vovel = matchedVovels[matchedVovels.length - 1];
                if (text.match('ou'))
                    vovel = 'o';
                if (text.match('a'))
                    vovel = 'a';
                if (text.match('e'))
                    vovel = 'e';
                return text.replace(vovel, vovel + toneMarks[tone - 1]).normalize('NFC');
            }
        }
        return text;
    };
    if (Array.isArray(data)) {
        return data.map(process);
    }
    else {
        return process(data);
    }
}
