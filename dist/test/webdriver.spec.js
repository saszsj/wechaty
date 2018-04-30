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
 *   Wechaty - https://github.com/chatie/wechaty
 *
 *   Copyright 2016-2017 Huan LI <zixia@zixia.net>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
const ava_1 = require("ava");
// import {
//   Browser
//   , By
// }                 from 'selenium-webdriver'
const _1 = require("../src/puppet-web/");
/**
 * WHY force to use SERIAL mode
 *
 * serial here is because we are checking browser pids inside test.
 * if 2 tests run parallel in the same process,
 * there will have race conditions for the conflict of `getBrowserPids()`
 */
ava_1.test.serial('WebDriver process create & quit test', (t) => __awaiter(this, void 0, void 0, function* () {
    try {
        const browser = new _1.Browser();
        t.truthy(browser, 'should instanciate a browser');
        yield browser.init();
        t.pass('should be inited successful');
        yield browser.open();
        t.pass('should open successful');
        let pids = yield browser.getBrowserPidList();
        t.truthy(pids.length > 0, 'should exist browser process after b.open()');
        yield browser.quit();
        t.pass('quited');
        pids = yield browser.getBrowserPidList();
        t.is(pids.length, 0, 'no driver process after quit');
    }
    catch (err) {
        t.fail(err.message || err);
    }
}));
ava_1.test.serial('WebDriver smoke testing', (t) => __awaiter(this, void 0, void 0, function* () {
    const browser = new _1.Browser();
    t.truthy(browser, 'Browser instnace');
    const mockPuppet = { browser: browser };
    const bridge = new _1.Bridge(mockPuppet, 8788);
    t.truthy(bridge, 'Bridge instnace');
    const m = (yield browser.getBrowserPidList()).length;
    t.is(m, 0, 'should has no browser process before get()');
    yield browser.driver.init();
    const driver = browser.driver.getWebDriver(); // for help function `execute`
    t.truthy(driver, 'should get webdriver instance');
    const injectio = bridge.getInjectio();
    t.truthy(injectio.length > 10, 'should got injectio script');
    yield driver.get('https://wx.qq.com/');
    t.pass('should open wx.qq.com');
    const n = (yield browser.getBrowserPidList()).length;
    t.truthy(n > 0, 'should exist browser process after get()');
    const retAdd = yield driverExecute('return 1+1');
    t.is(retAdd, 2, 'should return 2 for execute 1+1 in browser');
    const retInject = yield driverExecute(injectio, 8788);
    t.truthy(retInject, 'should return a object contains status of inject operation');
    t.is(retInject.code, 200, 'should got code 200 for a success wechaty inject');
    yield browser.driver.quit();
    return;
    //////////////////////////////////
    function driverExecute(arg1, arg2) {
        return driver.executeScript.apply(driver, arguments);
    }
}));
//# sourceMappingURL=webdriver.spec.js.map