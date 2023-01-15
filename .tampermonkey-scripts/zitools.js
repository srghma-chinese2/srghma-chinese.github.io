// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://zi.tools/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zi.tools
// @grant          GM_addStyle
// ==/UserScript==

(function() {
    'use strict';
    GM_addStyle(".content, .langgrid, #mainContent { background-color: var(--native-dark-bg-color) !important; }")
})();
