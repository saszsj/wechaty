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
const fs = require("fs");
const config_1 = require("../config");
class BrowserCookie {
    constructor(driver, storeFile) {
        this.driver = driver;
        this.storeFile = storeFile;
        config_1.log.verbose('PuppetWebBrowserCookie', 'constructor(%s, %s)', driver.constructor.name, storeFile ? storeFile : '');
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            // just check cookies, no file operation
            config_1.log.verbose('PuppetWebBrowserCookie', 'read()');
            // if (this.browser.dead()) {
            //   throw new Error('checkSession() - browser dead')
            // }
            try {
                // `as any as DriverCookie` because selenium-webdriver @types is outdated with 2.x, where we r using 3.0
                const cookies = yield this.driver.manage().getCookies();
                config_1.log.silly('PuppetWebBrowserCookie', 'read() %s', cookies.map(c => c.name).join(','));
                return cookies;
            }
            catch (e) {
                config_1.log.error('PuppetWebBrowserCookie', 'read() getCookies() exception: %s', e && e.message || e);
                throw e;
            }
        });
    }
    clean() {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('PuppetWebBrowserCookie', 'clean() file %s', this.storeFile);
            if (!this.storeFile) {
                return;
            }
            // if (this.browser.dead())  { return Promise.reject(new Error('cleanSession() - browser dead'))}
            const storeFile = this.storeFile;
            yield new Promise((resolve, reject) => {
                fs.unlink(storeFile, err => {
                    if (err && err.code !== 'ENOENT') {
                        config_1.log.silly('PuppetWebBrowserCookie', 'clean() unlink store file %s fail: %s', storeFile, err.message);
                    }
                    resolve();
                });
            });
            return;
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.storeFile) {
                config_1.log.verbose('PuppetWebBrowserCookie', 'save() no store file');
                return;
            }
            config_1.log.silly('PuppetWebBrowserCookie', 'save() to file %s', this.storeFile);
            const storeFile = this.storeFile;
            // if (this.browser.dead()) {
            //   throw new Error('saveSession() - browser dead')
            // }
            function cookieFilter(cookies) {
                const skipNames = [
                    'ChromeDriver',
                    'MM_WX_SOUND_STATE',
                    'MM_WX_NOTIFY_STATE',
                ];
                const skipNamesRegex = new RegExp(skipNames.join('|'), 'i');
                return cookies.filter(c => {
                    if (skipNamesRegex.test(c.name)) {
                        return false;
                    }
                    else {
                        return true;
                    }
                });
            }
            try {
                // `as any as DriverCookie` because selenium-webdriver @types is outdated with 2.x, where we r using 3.0
                let cookies = yield this.driver.manage().getCookies();
                cookies = cookieFilter(cookies);
                // log.silly('PuppetWeb', 'saving %d cookies for session: %s', cookies.length
                //   , util.inspect(cookies.map(c => { return {name: c.name /*, value: c.value, expiresType: typeof c.expires, expires: c.expires*/} })))
                config_1.log.silly('PuppetWebBrowserCookie', 'save() saving %d cookies: %s', cookies.length, cookies.map(c => c.name).join(','));
                const jsonStr = JSON.stringify(cookies);
                yield new Promise((resolve, reject) => {
                    fs.writeFile(storeFile, jsonStr, err => {
                        if (err) {
                            config_1.log.error('PuppetWebBrowserCookie', 'save() fail to write file %s: %s', storeFile, err.errno);
                            reject(err);
                        }
                        config_1.log.silly('PuppetWebBrowserCookie', 'save() %d cookies to %s', cookies.length, storeFile);
                        resolve(cookies);
                    });
                });
            }
            catch (e) {
                config_1.log.error('PuppetWebBrowserCookie', 'save() getCookies() exception: %s', e.message);
                throw e;
            }
        });
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('PuppetWebBrowserCookie', 'load() from %s', this.storeFile || '"undefined"');
            const cookies = this.getCookiesFromFile();
            if (!cookies) {
                config_1.log.silly('PuppetWebBrowserCookie', 'load() no cookies');
                return;
            }
            yield new Promise((resolve, reject) => {
                // let ps = arrify(this.add(cookies))
                const ps = [].concat(this.add(cookies) || []);
                Promise.all(ps)
                    .then(() => {
                    config_1.log.verbose('PuppetWebBrowserCookie', 'loaded session(%d cookies) from %s', cookies.length, this.storeFile);
                    return resolve(cookies);
                })
                    .catch(e => {
                    config_1.log.error('PuppetWebBrowserCookie', 'load() add() exception: %s', e.message);
                    return reject(e);
                });
            });
            return;
        });
    }
    getCookiesFromFile() {
        config_1.log.verbose('PuppetWebBrowserCookie', 'getCookiesFromFile() from %s', this.storeFile || '"undefined"');
        try {
            if (!this.storeFile) {
                throw new Error('no store file');
            }
            fs.statSync(this.storeFile).isFile();
        }
        catch (err) {
            config_1.log.silly('PuppetWebBrowserCookie', 'getCookiesFromFile() no cookies: %s', err.message);
            return null;
        }
        const jsonStr = fs.readFileSync(this.storeFile);
        const cookies = JSON.parse(jsonStr.toString());
        return cookies;
    }
    hostname() {
        config_1.log.verbose('PuppetWebBrowserCookie', 'hostname()');
        const DEFAULT_HOSTNAME = 'wx.qq.com';
        const cookieList = this.getCookiesFromFile();
        if (!cookieList || cookieList.length === 0) {
            config_1.log.silly('PuppetWebBrowserCookie', 'hostname() no cookie, return default hostname');
            return DEFAULT_HOSTNAME;
        }
        const wxCookieList = cookieList.filter(c => /^webwx_auth_ticket|webwxuvid$/.test(c.name));
        if (!wxCookieList.length) {
            config_1.log.silly('PuppetWebBrowserCookie', 'hostname() no valid cookie in files, return default hostname');
            return DEFAULT_HOSTNAME;
        }
        let domain = wxCookieList[0].domain.slice(1);
        if (domain === 'wechat.com') {
            domain = 'web.wechat.com';
        }
        config_1.log.silly('PuppetWebBrowserCookie', 'hostname() got %s', domain);
        return domain;
    }
    /**
     * only wrap addCookies for convinience
     *
     * use this.driver().manage() to call other functions like:
     * deleteCookie / getCookie / getCookies
     */
    // TypeScript Overloading: http://stackoverflow.com/a/21385587/1123955
    add(cookie) {
        return __awaiter(this, void 0, void 0, function* () {
            // if (this.browser.dead()) { return Promise.reject(new Error('addCookies() - browser dead'))}
            if (Array.isArray(cookie)) {
                for (const c of cookie) {
                    yield this.add(c);
                }
                return;
            }
            /**
             * convert expiry from seconds to milliseconds. https://github.com/SeleniumHQ/selenium/issues/2245
             * with selenium-webdriver v2.53.2
             * NOTICE: the lastest branch of selenium-webdriver for js has changed the interface of addCookie:
             * https://github.com/SeleniumHQ/selenium/commit/02f407976ca1d516826990f11aca7de3c16ba576
             */
            // if (cookie.expiry) { cookie.expiry = cookie.expiry * 1000 /* XXX: be aware of new version of webdriver */}
            config_1.log.silly('PuppetWebBrowserCookie', 'addCookies(%s)', JSON.stringify(cookie));
            // return new Promise((resolve, reject) => {
            try {
                yield this.driver.manage().addCookie(cookie);
                // this is old webdriver format
                // .addCookie(cookie.name, cookie.value, cookie.path
                //   , cookie.domain, cookie.secure, cookie.expiry)
                // this is new webdriver format
            }
            catch (e) {
                config_1.log.warn('PuppetWebBrowserCookie', 'addCookies() exception: %s', e.message);
                throw e;
            }
        });
    }
}
exports.BrowserCookie = BrowserCookie;
exports.default = BrowserCookie;
//# sourceMappingURL=browser-cookie.js.map