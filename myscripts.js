const containerId = 'kanjiIframeContainer'

// function waitForElementToAppear(get) {
//   return new Promise(function (resolve, reject) {
//       (function doWait(){
//         const element = get()
//         if (element) return resolve(element)
//         setTimeout(doWait, 0)
//       })();
//   });
// }

// window.copyToClipboard = (
//   value,
//   successfully = () => null,
//   failure = () => null
// ) => {
//   const clipboard = navigator.clipboard;
//   if (clipboard !== undefined && clipboard !== "undefined") {
//     navigator.clipboard.writeText(value).then(successfully, failure);
//   } else {
//     if (document.execCommand) {
//       const el = document.createElement("input");
//       el.value = value;
//       document.body.append(el);

//       el.select();
//       el.setSelectionRange(0, value.length);

//       if (document.execCommand("copy")) {
//         successfully();
//       }

//       el.remove();
//     } else {
//       failure();
//     }
//   }
// };

;(function() {
  function reset() {
    const removeClassFromAllElements = kl => {
      // console.log(kl)
      Array.from(document.querySelectorAll('.' + kl)).forEach(el => {
        // console.log(el)
        el.classList.remove(kl)
      })
    }
    [ "my-pinyin-translation-container--force-show", "my-pinyin-hanzi--force-show", "pinyin__root_container--show" ].forEach(removeClassFromAllElements)

    if (isCurrentPageAHPage) {
      document.getElementById(containerId).innerHTML = ''
    }
  }

  window.showRootContainer = function(pinyin) {
    reset()

    const pinyinPeplace = {
      'yü':   'yu',
      'yüe':  'yue',
      'yüan': 'yuan',
      'yün':  'yun',
      'nü':   'nu:',
      'nüe':  'nu:e',
      'lü':   'lu:',
      'lüe':  'lu:e',
      'jü':   'ju',
      'jüe':  'jue',
      'jüan': 'juan',
      'jün':  'jun',
      'qü':   'qu',
      'qüe':  'que',
      'qüan': 'quan',
      'qün':  'qun',
      'xü':   'xu',
      'xüe':  'xue',
      'xüan': 'xuan',
      'xün':  'xun',
    }

    const pinyinPeplace2 = {
      'yv':   'yu',
      'yve':  'yue',
      'yvan': 'yuan',
      'yvn':  'yun',
      'nv':   'nu:',
      'nve':  'nu:e',
      'lv':   'lu:',
      'lve':  'lu:e',
      'jv':   'ju',
      'jve':  'jue',
      'jvan': 'juan',
      'jvn':  'jun',
      'qv':   'qu',
      'qve':  'que',
      'qvan': 'quan',
      'qvn':  'qun',
      'xv':   'xu',
      'xve':  'xue',
      'xvan': 'xuan',
      'xvn':  'xun',
    }

    const id = `pinyin__root_container__${pinyinPeplace[pinyin] || pinyinPeplace2[pinyin] || pinyin}`
    // console.log({ id })
    document.title = pinyin
    document.getElementById(id).classList.add('pinyin__root_container--show')
  }

  if (!isCurrentPageAHPage) {
    if(window.location.hash) {
      try {
        const tablePinyin = decodeURIComponent(window.location.hash.slice(1))
        window.showRootContainer(tablePinyin)
        document.title = tablePinyin
        // el.scrollIntoView({
        //   behavior: 'smooth', // smooth scroll
        //   block: 'start' // the upper border of the element will be aligned at the top of the visible part of the window of the scrollable area.
        // })
      } catch (e) {
        console.error(e)
      }
    }
  }
})();

;(function() {
  window.showKanjiIframe = async function(hanziEncoded) {
    if (!isCurrentPageAHPage) {
      window.open(`h.html#${hanziEncoded}`, '_blank').focus()
      // window.copyToClipboard(hanziEncoded)
      return
    }
  }
})();

;(function() {
  if (!isCurrentPageAHPage) {
    function enhanceWithLinkToH(containerElement) {
      // onmouseover="window.copyToClipboard('${ch} ')"
      const colorizer = (ch, colorIndex) => `<span onclick="window.showKanjiIframe('${ch}')">${ch}</span>`
      const ruby_chars = [...containerElement.innerHTML]
      containerElement.innerHTML = ruby_chars.map(ch => isHanzi(ch) ? colorizer(ch) : ch).join('')
    }

    Array.from(document.querySelectorAll('.my-pinyin-hanzi')).forEach(enhanceWithLinkToH)
  }
})();

;(async function() {
  if (isCurrentPageAHPage && window.location.hash) {
    const hanziEncoded = window.location.hash.slice(1)

    const hanzi = decodeURIComponent(hanziEncoded)
    if (!hanzi) { return }

    const { allHanziAnkiInfo, hanziAnkiInfo, ruPinyinText } = await asyncLoadHanziAnkiInfoAndAllAnkiInfoAndText(hanzi)

    // console.log(hanziAnkiInfo)

    const containerElement = document.getElementById(containerId)
    if (hanziAnkiInfo) {
      showText(containerElement, hanziAnkiInfo.rendered)
    }
    document.title = hanzi

    // console.log(hanziAnkiInfo)

    // play audio
    ;(async function() {
      try {
        const firstAudio = Array.from(document.querySelectorAll('.my-pinyin-tone a')).map(x => x.href).filter(x => x.endsWith('.mp3'))[0]

        if (!firstAudio) { return }

        const audioEl = document.createElement('audio');
        audioEl.style.cssText = 'display: none;';
        audioEl.src = firstAudio
        audioEl.load()
        audioEl.autoplay = true;

        if (!isFileSystem) {
          document.body.addEventListener('click', () => {
            audioEl.play().catch(e => {
              console.log(e)
              // document.body.innerHTML = e.toString()
            })
          }, { once: true });
        }

        // await audioEl.play()
        document.body.appendChild(audioEl)
      } catch (e) {
        document.body.innerHTML = e.toString()
      }
    })();
    //////

    let ruPinyinObject = null

    try {
      ruPinyinObject = recomputeCacheAndThrowIfDuplicate(ruPinyinTextToArray(ruPinyinText))
    } catch (e) {
      const errorElement = document.createElement('div')
      errorElement.style.cssText = 'color: red;'
      errorElement.innerHTML = e.toString()
      window.document.body.insertBefore(errorElement, window.document.body.firstChild)
      throw e
    }

    const ruPinyinObject_small = mk_ruPinyinObject_small(ruPinyinObject)

    ;(function() {
      /// colorize
      const links = Array.from(document.querySelectorAll('#ch_with_same_pronounciation a'))

      links.map(link => {
        const alreadyIsInMyDict = ruPinyinObject.hasOwnProperty(link.textContent)
        const alreadyIsInMyDict__and_small = ruPinyinObject_small.has(link.textContent)
        if (alreadyIsInMyDict__and_small) {
          link.style.color = '#ff6d91'
          return
        }
        if (alreadyIsInMyDict) { return }
        link.style.color = 'red'
      })
    })();

    ///

    ;(function() {
      function charactersToHTML(characters) {
        // console.log(characters)
        characters = characters || []
        if (characters.length <= 0) { return }

        function hasImage(ch) {
          // <a href="https://images.yw11.com/zixing/zi148275358012978.png" target="_blank"><img src="file:///home/srghma/projects/srghma-chinese-files/collection.media/yw11-zixing-zi148275358012978.png"></a>
          const { rendered } = allHanziAnkiInfo[ch] || {}
          if (!rendered) { return false }
          return rendered.includes("href=\"https://images.yw11.com/zixing/") && rendered.includes(".png\"")
        }

        let html = characters.map(ch => {
          const alreadyIsInMyDict = ruPinyinObject.hasOwnProperty(ch)
          const alreadyIsInMyDict__and_small = ruPinyinObject_small.has(ch)
          const { purpleculture_hsk, chinese_junda_freq_ierogliph_number } = allHanziAnkiInfo[ch] || {}
          const unknownHanziHasIt = unknownHanzi.has(ch)

          const color = (function () {
            if (alreadyIsInMyDict__and_small) { return '#ff6d91' }
            return alreadyIsInMyDict ? null : 'red'
          })();

          const color_ = color ? `color: ${color};` : ''
          const purpleculture_hsk_ = purpleculture_hsk ? ` (${purpleculture_hsk})` : ''
          const unknownHanzi_ = unknownHanzi.has(ch) ? ` !` : ''
          const hasImage_ = hasImage(ch) ? ` i` : ''
          const html = `<span style="user-select: text; ${color_}"><a style="user-select: text; ${color_}" target="_blank" href="h.html#${ch}">${ch}</a>${purpleculture_hsk_ || unknownHanzi_}${hasImage_}</span>`
          // html
          const should_come_first = purpleculture_hsk ? (-purpleculture_hsk) - 100 : (unknownHanziHasIt ? -50 : 0)
          return { should_come_first, html }
        })
        // html = sortBy(x => x.chinese_junda_freq_ierogliph_number, html)
        html = sortBy(x => x.should_come_first, html)
        html = html.map(x => x.html)
        html = html.join(", ")
        return html
      }

      function attachToTopOfBody(header, html) {
        if (!html) { return }
        const element = document.createElement('div')
        element.style.cssText = 'font-size: 30px; margin-bottom: 30px;'
        element.innerHTML = `<p>${header}: </p> ${html}`
        window.document.body.insertBefore(element, window.document.body.firstChild)
      }

      attachToTopOfBody(
        "charactersWithComponent_hanziyuan",
        charactersToHTML(hanziAnkiInfo.isMentionedAt__hanziyuan_without_charactersWithComponent)
      )

      attachToTopOfBody(
        "charactersWithComponent",
        charactersToHTML(hanziAnkiInfo.charactersWithComponent)
      )
    })();

    ///

    console.log('ruPinyinObject', ruPinyinObject[hanzi])
    console.log('allHanziAnkiInfo', allHanziAnkiInfo[hanzi])

    // if (false) {
    if (ruPinyinObject.hasOwnProperty(hanzi)) {
      const ruPinyinPreElement = document.createElement('pre')
      ruPinyinPreElement.style.cssText = 'font-size: 25px; width:100%; background:rgb(192,192,192); text-align: start; color: black;'
      window.document.body.insertBefore(ruPinyinPreElement, window.document.body.firstChild)
      ruPinyinPreElement.textContent = ruPinyinObject[hanzi]
    }

    const ruPinyinPreDummyElement = document.createElement('pre')
    ruPinyinPreDummyElement.style.cssText = 'font-size: 25px; width:100%; background:rgb(192,192,192); text-align: start; color: black;'
    ruPinyinPreDummyElement.textContent = showDummyAnkiInfo({ allHanziAnkiInfo, hanzi })
    ruPinyinPreDummyElement.addEventListener("click", function (e) {
      navigator.clipboard.writeText(ruPinyinPreDummyElement.textContent)
        .then(() => {
          const x = document.querySelector(`a[href^='https://lens.google.com/uploadbyurl?url=https://images.yw11.com/zixing/'`)
          if (!x) return
          x.scrollIntoView()
          x.click()
        })
        .catch((e) => {
          console.log(e)
        });
    })
    window.document.body.insertBefore(ruPinyinPreDummyElement, window.document.body.firstChild)
  }
})();

////////////

;(function insertGoUpButton() {
  const upButtonElement = document.createElement('button')
  upButtonElement.style.cssText = 'position: fixed; right: 20px; top: 20px;'
  upButtonElement.textContent = 'Up'
  upButtonElement.addEventListener("click", function (e) {
    window.scrollTo(0, 0);
  })
  window.document.body.insertBefore(upButtonElement, window.document.body.firstChild)

  const toIndexElement = document.createElement('button')
  toIndexElement.style.cssText = 'position: fixed; right: 20px; top: 50px;'
  toIndexElement.textContent = 'Index'
  toIndexElement.addEventListener("click", function (e) {
    window.open(`${mychineseSitePrefix__root}/index.html`, '_blank').focus()
  })
  window.document.body.insertBefore(toIndexElement, window.document.body.firstChild)
})();

////////////

;(function() {
function hideByDefaultAndShowOnClick(elements, classToAddToShow) {
  Array.from(document.getElementsByClassName(elements)).forEach((element) => {
    element.classList.add(classToAddToShow);

    // function eventListener(event) {
    //   event.preventDefault();
    //   element.classList.add(classToAddToShow);
    //   // element.removeEventListener('click', eventListener);
    // }
    // element.addEventListener('click', eventListener);
  });
}
hideByDefaultAndShowOnClick("my-pinyin-translation-container", "my-pinyin-translation-container--force-show")
hideByDefaultAndShowOnClick("my-pinyin-hanzi", "my-pinyin-hanzi--force-show")
})();

;(function() {
  function show(parentElement, elementsToFindClass, classToAddToShow) {
    Array.from(parentElement.getElementsByClassName(elementsToFindClass)).forEach((element) => {
      element.classList.add(classToAddToShow)
    })
  }
  function eventListener(event) {
    event.preventDefault();
    const parentElement = event.target.parentElement
    show(parentElement, "my-pinyin-translation-container", "my-pinyin-translation-container--force-show")
    show(parentElement, "my-pinyin-hanzi", "my-pinyin-hanzi--force-show")
  }
  Array.from(document.querySelectorAll("h1")).forEach((element) => {
    show(element, "my-pinyin-translation-container", "my-pinyin-translation-container--force-show")
    show(element, "my-pinyin-hanzi", "my-pinyin-hanzi--force-show")

    element.addEventListener('click', eventListener)
  })
})();

;(function() {
  const table = document.querySelector('table')
  if (table && document.body.offsetWidth < table.offsetWidth) {
    document.body.style.width = `${table.offsetWidth}px`
  }
})();
