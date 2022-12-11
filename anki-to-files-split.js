#!/usr/bin/env node
'use strict';

const path = require('path')
const R = require('ramda')
const hanzijs = require("hanzi");
//Initiate
hanzijs.start();

// const unescapejs = require("unescape-js");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM(``);

const isHanzi = require('/home/srghma/projects/anki-cards-from-pdf/scripts/lib/isHanzi').isHanzi

let x = null
x = JSON.parse(require('fs').readFileSync('./files/anki.json').toString()); null

const buffer = []

R.mapObjIndexed((val, key) => {
  let text = val.hanziyuan
  if (!text) { return }
  dom.window.document.body.innerHTML = text
  text = dom.window.document.body.innerHTML.trim()
  // console.log(text)
  // text = unescapejs(text)
  let thisIsComposedFrom = Array.from(text.matchAll(/Character decomposition(.*?)<\/p>/gms)).map(x => x[1].replace(/字形分解/, ''))
  thisIsComposedFrom = thisIsComposedFrom.join('').split('').filter(x => isHanzi(x))
  thisIsComposedFrom = R.uniq(thisIsComposedFrom).filter(x => x !== key)
  buffer.push([key, thisIsComposedFrom])
  // return decomposition
  // return text
}, x); null
// }, R.pickAll(['干'], x))

let thisIsMentionedAt = buffer.map(([key, thisIsComposedFrom]) => thisIsComposedFrom.map(thisIsMentionedAt => [thisIsMentionedAt, key]))
thisIsMentionedAt = thisIsMentionedAt.flat()
thisIsMentionedAt = R.groupBy(R.prop(0), thisIsMentionedAt)
thisIsMentionedAt = R.mapObjIndexed((val, key) => R.map(R.prop(1), val), thisIsMentionedAt)

x = R.mapObjIndexed((val, key) => {
  delete val['charactersWithComponent']
  let array = hanzijs.getCharactersWithComponent(key)
  if (Array.isArray(array) && array.length > 0) {
    // if 干
    // was [于, 平, 许, 南, 干, 除, 余, 评, 幸, 赶]
    // now [干, 赶, 于, 平, 许, 南, 除, 余, 评, 幸]
    array = R.sortBy(ch => {
      let { components } = hanzijs.decompose(ch, 1)
      components = components.filter(x => x !== 'No glyph available')
      let level = components.filter(x => x === key).length
      // console.log({ ch, components, level })
      return level > 0 ? 1 : 0
    }, array)
    // return array
    val['charactersWithComponent'] = array
  }
  return val
}, x); null
// }, { '干': null }); null

x = R.mapObjIndexed((val, key) => {
  delete val['isMentionedAt__hanziyuan']
  delete val['isMentionedAt__hanziyuan_without_charactersWithComponent']
  if (thisIsMentionedAt[key]) {
    val['isMentionedAt__hanziyuan_without_charactersWithComponent'] = R.difference(thisIsMentionedAt[key], val['charactersWithComponent'] || [])
  }
  return val
}, x); null

R.mapObjIndexed((val, key) => { if (!R.is(Object, val)) { throw new Error(key) } }, x)

// x_['干']

// require('fs').writeFileSync(`./files/anki.json`, JSON.stringify(x, undefined, 2))
require('fs').writeFileSync(`./files/anki.json`, JSON.stringify(x))

R.values(x).forEach(x => {
  require('fs/promises').writeFile(`./files-split/${x.kanji}.json`, JSON.stringify(x))
})

// require('fs/promises').writeFile('./anki-addon-glossary/anki-addon-glossary.json', JSON.stringify(x, undefined, 2))
