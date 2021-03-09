// ==UserScript==
// @name         《弹幕世界2》 B 站启动器
// @namespace    danmakucraft.com
// @version      0.5
// @description  在 B 站播放器内玩《弹幕世界2》：https://www.bilibili.com/video/av19771370/。官网：https://danmakucraft.com
// @author       yehzhang
// @include      /^http(s)?:\/\/www\.bilibili\.com\/video\/(av19771370|BV1GW41177LA)((\?|\/)(.*))?$/
// @include      /^http(s)?:\/\/www\.bilibili\.com/blackboard\/(html5|new)?player\.html\?(aid=19771370|(bvid=(BV)?1GW41177LA))(&(.*))?$/
// @grant        none
// @run-at       document-idle
// @license      AGPL-3.0
// ==/UserScript==

(function () {
  'use strict';

  var scriptElement = document.createElement('script');
  scriptElement.src = 'https://danmakucraft.com/bundle.js?nonsense=' + Math.random();

  var bodyElement = document.querySelector('body');
  bodyElement.appendChild(scriptElement);
})();
