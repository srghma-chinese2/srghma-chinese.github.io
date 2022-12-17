# srghma-chinese

https://srghma-chinese.github.io/

https://t.me/srghmachinese

https://ankiweb.net/shared/info/1904624237

DICTIONARY IS HERE https://mega.nz/folder/Nh1TgKTB#d6oo1sTLSah-zwXcz-gCvg

![Imgur](https://i.imgur.com/KTuAfyY.png?1)

some files are being served from https://github.com/srghma-chinese-files/srghma-chinese-files.github.io

#### scripts

```sh
# useful
git lfs install
git lfs track
git lfs migrate import --no-rewrite files/anki.json
```

```js
// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://lens.google.com/search*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// ==/UserScript==


function doAsynclyOnce(find, isValid, doSomething) {
    let retries = 50;

    const intervalID = setInterval(_ => {
        const element = find();
        const valid = isValid(element);
        console.log('trying', element, valid)
        if(valid) doSomething(element);

        retries--;
        if(retries === 0 || valid) clearInterval(intervalID);
    }, 100);
}

(function() {
    'use strict';

    doAsynclyOnce(
        () => document.getElementById("ucj-5"),
        element => element,
        element => {
            console.log(element)
            element.click()

            doAsynclyOnce(
                () => document.getElementById("ucc-5"),
                element => element,
                element => {
                    element.click()
                    window.close()
                }
            )

        }
    )
})();
```

```js
// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://translate.google.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// ==/UserScript==

(function() {
    'use strict';
    function doSomething(element) {
        element.value = element.value.replace(/;/g, ';\n').replace(/。/g, '。\n').replace(/:\s?\S+?。/g, '。')
        element.dispatchEvent(new Event('change'))
    }

    let retries = 50;

const intervalID = setInterval(_ => {
    const match = document.querySelector("textarea");
    const valid = match && match.value !== ""
    if(valid) doSomething(match);

    retries--;
    if(retries === 0 || valid) clearInterval(intervalID);
}, 100);


})();
```
