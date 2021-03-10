// ==UserScript==
// @name         《弹幕世界2》 B 站启动器 - 开发者模式
// @namespace    danmakucraft.com
// @version      0.1
// @author       yehzhang
// @include      /^http(s)?:\/\/www\.bilibili\.com\/video\/(av19771370|BV1GW41177LA)((\?|\/)(.*))?$/
// @include      /^http(s)?:\/\/www\.bilibili\.com\/blackboard\/html5player\.html\?aid=19771370&cid=32239646(&(.*))?$/
// @include      /^http(s)?:\/\/www\.bilibili\.com\/blackboard\/(new)?player\.html\?(aid=19771370|(bvid=(BV)?1GW41177LA))(&(.*))?$/
// @grant        none
// @run-at       document-end
// @license      AGPL-3.0
// ==/UserScript==

async function main() {
  const scriptElement = document.createElement('script');
  scriptElement.src = (await isDev())
    ? `${devServerBaseUrl}/bundle.js`
    : `https://danmakucraft.com/bundle.js?nonsense=${Math.random()}`;

  const bodyElement = document.querySelector('body');
  bodyElement.appendChild(scriptElement);
}

async function isDev() {
  const params = Object.fromEntries(
    location.hash
      .slice(1)
      .split('&')
      .map((paramString) => paramString.split('='))
  );
  if (Object.prototype.hasOwnProperty.call(params, 'env')) {
    if (params.env === 'prod') {
      return false;
    }
    if (params.env === 'dev') {
      return true;
    }
    throw new TypeError('Expected valid env param');
  }

  try {
    await fetch(devServerBaseUrl);
  } catch {
    return false;
  }
  return true;
}

const devServerBaseUrl = 'https://localhost:8080';

main();
