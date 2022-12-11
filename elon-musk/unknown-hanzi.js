;(async function() {
  if (window.location.host === 'srghma-chinese.github.io') { return }

  const allHanziAnkiInfo = await allHanziAnkiInfoPromise()

  const hanzisInfo = Array.from(document.querySelectorAll('a')).map(x => x.textContent).map(x => allHanziAnkiInfo[x]).filter(x => x)

  console.log(hanzisInfo)

  ;(function() {
    hanziDummyInfo = hanzisInfo.map(hanziAnkiInfo => showDummyAnkiInfo({ allHanziAnkiInfo, hanzi: hanziAnkiInfo.kanji }))
    // hanziDummyInfo = await Promise.all(hanziDummyInfo)
    hanziDummyInfo = hanziDummyInfo.join('\n-----\n\n')

    const ruPinyinPreElement = document.createElement('pre')
    ruPinyinPreElement.id = 'ru-pinyin-pre'
    ruPinyinPreElement.textContent = hanziDummyInfo
    ruPinyinPreElement.style.cssText = 'width:100%;background:rgb(192,192,192); text-align: start; color: black;'

    const parentContainer = document.querySelector('#container-right')
    parentContainer.insertBefore(ruPinyinPreElement, parentContainer.firstChild)
  })();

  //////////////////
  window.openNextHanzi = function() {
    hanzisInfo.slice(0, 5).forEach(hanziAnkiInfo => openNextHanziInfo(hanziAnkiInfo.kanji))
  }

  // const alreadyVisitedHanzi = []
  function openNextHanziInfo(hanzi) {
    // const element = Array.from(document.querySelectorAll('a'))[0]
    // const hanzi = element.textContent
    const hanziAnkiInfo = allHanziAnkiInfo[hanzi]
    if (!hanziAnkiInfo) { throw new Error(`no hanzi info ${hanzi}`) }
    const otherKanji = showDummyAnkiInfo__getOtherKanjiFromRendered(hanziAnkiInfo.rendered).filter(x => x !== hanziAnkiInfo.kanji)

    // const all = [hanzi, ...otherKanji]
    const all = [hanzi].concat(otherKanji)

    all.forEach(hanzi => {
      const hanzi_ = encodeURIComponent(hanzi)
      window.open(`${mychineseSitePrefix__root}/h.html#${hanzi_}`, '_blank')
      window.open("https://baike.baidu.com/item/" + hanzi_, '_blank')
      window.open("http://humanum.arts.cuhk.edu.hk/Lexis/lexi-mf/search.php?word=" + hanzi_, '_blank')
      window.open("https://ctext.org/dictionary.pl?if=gb&char=" + hanzi_, '_blank')
      window.open("https://www.zdic.net/search/?sclb=tm&q=" + hanzi_, '_blank')
    })
    // window.open("../h.html#" + hanzi_)
  }

  document.querySelectorAll('[data-open-hanzi]').forEach(element => {
    // console.log(element)
    const hanzi = element.textContent
    element.addEventListener('click', function(e) {
      e.preventDefault()
      openNextHanziInfo(hanzi)
    })
  })

  // document.body.addEventListener('keyup', function (event) {
  //   if (event.key === "n") {
  //     openNextHanziInfo()
  //   }
  // })
})();
