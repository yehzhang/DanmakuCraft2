// ==UserScript==
// @name         《弹幕世界2》 B 站启动器
// @namespace    danmakucraft.com
// @version      0.1
// @description  在 B 站播放器内玩《弹幕世界2》。
// @author       yehzhang
// @match        *://www.bilibili.com/video/av19771370/
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  var loadGame = function () {
    var scriptElement = document.createElement('script');
    scriptElement.src = 'https://danmakucraft.com/static/prod/bundle.js';

    var bodyElement = document.querySelector('body');
    bodyElement.appendChild(scriptElement);
  };

  var switchToHtml5Player = function () {
    if (!window.GrayManager) {
      return;
    }
    try {
      GrayManager.html5_btn.click();
    } catch (ignored) {
      try {
        GrayManager.clickMenu('change_h5');
        GrayManager.clickMenu('change_new_h5');
      } catch (ignored) {
      }
    }
  };

  var waitUntilGameContainerIsReady = function () {
    switchToHtml5Player();

    var playerElement = document.querySelector('.bilibili-player-video-wrap');
    if (playerElement == null) {
      setTimeout(waitUntilGameContainerIsReady, 100);
    } else {
      loadGame();
    }
  };
  waitUntilGameContainerIsReady();
})();
