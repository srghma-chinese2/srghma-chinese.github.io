// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://translate.google.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// ==/UserScript==

// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant       GM_addStyle

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


// waitForKeyElements(
//     "textarea",
//     function(element) {
//
//     },
//     true
// );

})();
