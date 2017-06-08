"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Wechaty - Wechat for Bot. Connecting ChatBots
 *
 * Licenst: ISC
 * https://github.com/wechaty/wechaty
 *
 */
const WebDriver = require("selenium-webdriver");
const express = require("express");
const http = require("http");
const url = require("url");
/* tslint:disable:no-var-requires */
/* tslint:disable:variable-name */
const Phantomjs = require('phantomjs-prebuilt');
const ava_1 = require("ava");
const util_lib_1 = require("../src/util-lib");
ava_1.test.skip('Phantomjs replace javascript source file content test', (t) => __awaiter(this, void 0, void 0, function* () {
    const phantomjsArgs = [
        '--load-images=false',
        '--ignore-ssl-errors=true',
        '--web-security=false',
        '--ssl-protocol=TLSv1',
        '--webdriver-loglevel=WARN',
    ];
    const customPhantom = WebDriver.Capabilities.phantomjs()
        .set('phantomjs.binary.path', Phantomjs.path)
        .set('phantomjs.cli.args', phantomjsArgs);
    const driver = new WebDriver.Builder()
        .withCapabilities(customPhantom)
        .build();
    driver.executePhantomJS(`
this.onResourceRequested = function(request, net) {
  console.log('REQUEST ' + request.url);
  alert('REQUEST ' + request.url);
  // blockRe = /wx\.qq\.com\/\?t=v2\/fake/i
  // https://res.wx.qq.com/zh_CN/htmledition/v2/js/webwxApp2fd632.js
  var webwxAppRe = /res\.wx\.qq\.com\/zh_CN\/htmledition\/v2\/js\/webwxApp.+\.js$/i
  alert('################### matching ' + request.url)
  if (webwxAppRe.test(request.url)) {
    console.log('Abort ' + request.url);
    net.abort();
    alert('################### found ' + request.url)
    var url = request.url + '?' + Date.now()
    load(url, function(source) {
      eval( fix(source) )
    })
  }

  function load(url, cb) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
          cb(xhr.responseText)
        }
      }
      xhr.send(null)
    }
  }

  function fix(source) {
    // "54c6b762ad3618c9ebfd4b439c8d4bda" !== h && ($.getScript("https://tajs.qq.com/stats?sId=54802481"),
    //        location.href = "https://wx.qq.com/?t=v2/fake")
    var fixRe = /"54c6b762ad3618c9ebfd4b439c8d4bda".+?&& \(.+?fake"\)/i
    return source.replace(fixRe, '')
  }
}
`);
    yield driver.get('https://wx.qq.com');
    // console.log(await driver.getTitle())
    // t.end()
}));
ava_1.test('Phantomjs http header', (t) => __awaiter(this, void 0, void 0, function* () {
    // co(function* () {
    const port = yield util_lib_1.UtilLib.getPort(8080);
    // console.log(express)
    const app = express();
    app.use((req, res, done) => {
        // console.log(req.headers)
        t.is(req.headers['referer'], 'https://wx.qq.com/');
        done();
    });
    const server = app.listen(port, _ => {
        t.pass('server listen on ' + port);
    });
    const serverUrl = 'http://127.0.0.1:' + port;
    const options = url.parse(serverUrl);
    options['headers'] = {
        Accept: 'image/webp,image/*,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36',
        Referer: 'https://wx.qq.com/',
        'Accept-Encoding': 'gzip, deflate, sdch',
        'Accept-Language': 'zh-CN,zh;q=0.8',
    };
    options['agent'] = http.globalAgent;
    const req = http.request(options, (res) => {
        // console.log(`STATUS: ${res.statusCode}`);
        // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        // res.setEncoding('utf8');
        t.pass('http.request done');
        server.close();
    });
    req.on('error', e => {
        t.fail('req error');
    });
    req.end();
    // }).catch(e => {
    //   t.fail(e)
    // }).then(_ => {
    // t.end()
    // })
}));
//# sourceMappingURL=webdriver-phantomjs.spec.js.map