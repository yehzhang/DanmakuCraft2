// ==UserScript==
// @name         《弹幕世界2》 B 站启动器 - 开发者模式
// @namespace    danmakucraft.com
// @version      0.1
// @author       yehzhang
// @match        *://www.bilibili.com/video/av19771370
// @match        *://www.bilibili.com/video/av19771370?*
// @match        *://www.bilibili.com/video/av19771370/*
// @match        *://www.bilibili.com/video/BV1GW41177LA
// @match        *://www.bilibili.com/video/BV1GW41177LA?*
// @match        *://www.bilibili.com/video/BV1GW41177LA/*
// @grant        none
// @run-at       document-end
// @license      AGPL-3.0
// ==/UserScript==

async function main() {
  const scriptElement = document.createElement('script');
  scriptElement.src = await getScriptUrl();

  const bodyElement = document.querySelector('body');
  bodyElement.appendChild(scriptElement);
}

async function getScriptUrl() {
  const devServerBaseUrl = 'https://localhost:8080';
  try {
    await fetch(devServerBaseUrl);
  } catch {
    // Prod URL.
    return `https://danmakucraft.com/bundle.js?nonsense=${Math.random()}`;
  }
  // Dev URL.
  return `${devServerBaseUrl}/bundle.dev.js`;
}

main();
