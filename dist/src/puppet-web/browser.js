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
const psTree = require('ps-tree');
const events_1 = require("events");
const state_switch_1 = require("state-switch");
/* tslint:disable:no-var-requires */
const retryPromise = require('retry-promise').default; // https://github.com/olalonde/retry-promise
const config_1 = require("../config");
const browser_cookie_1 = require("./browser-cookie");
const browser_driver_1 = require("./browser-driver");
class Browser extends events_1.EventEmitter {
    constructor(setting = {
            head: config_1.config.head,
            sessionFile: '',
        }) {
        super();
        this.setting = setting;
        // public hostname: string
        this.state = new state_switch_1.StateSwitch('Browser', 'close', config_1.log);
        config_1.log.verbose('PuppetWebBrowser', 'constructor() with head(%s) sessionFile(%s)', setting.head, setting.sessionFile);
        this.driver = new browser_driver_1.BrowserDriver(this.setting.head);
        this.cookie = new browser_cookie_1.BrowserCookie(this.driver, this.setting.sessionFile);
    }
    toString() { return `Browser({head:${this.setting.head})`; }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('PuppetWebBrowser', 'init()');
            /**
             * do not allow to init() twice without quit()
             */
            if (this.state.current() === 'open') {
                let e;
                if (this.state.inprocess()) {
                    e = new Error('init() fail: current state is `open`-`ing`');
                }
                else {
                    e = new Error('init() fail: current state is `open`');
                }
                config_1.log.error('PuppetWebBrowser', e.message);
                throw e;
            }
            this.state.target('open');
            this.state.current('open', false);
            const hostname = this.cookie.hostname();
            // jumpUrl is used to open in browser for we can set cookies.
            // backup: 'https://res.wx.qq.com/zh_CN/htmledition/v2/images/icon/ico_loading28a2f7.gif'
            const jumpUrl = `https://${hostname}/zh_CN/htmledition/v2/images/webwxgeticon.jpg`;
            try {
                yield this.driver.init();
                config_1.log.verbose('PuppetWebBrowser', 'init() driver.init() done');
                yield this.open(jumpUrl);
                yield this.loadCookie()
                    .catch(e => {
                    config_1.log.verbose('PuppetWebBrowser', 'browser.loadSession(%s) exception: %s', this.setting.sessionFile, e && e.message || e);
                });
                yield this.open();
                /**
                 * when open url, there could happen a quit() call.
                 * should check here: if we are in `close` target state, we should clean up
                 */
                if (this.state.target() !== 'open') {
                    throw new Error('init() open() done, but state.target() is set to close after that. has to quit().');
                }
                this.state.current('open');
                return;
            }
            catch (err) {
                config_1.log.error('PuppetWebBrowser', 'init() exception: %s', err.message);
                yield this.quit();
                throw err;
            }
        });
    }
    hostname() {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('PuppetWebBrowser', 'hostname()');
            const domain = yield this.execute('return document.domain');
            config_1.log.silly('PuppetWebBrowser', 'hostname() got %s', domain);
            return domain;
        });
    }
    open(url) {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('PuppetWebBrowser', `open(${url})`);
            if (!url) {
                const hostname = this.cookie.hostname();
                if (!hostname) {
                    throw new Error('hostname unknown');
                }
                url = `https://${hostname}`;
            }
            const openUrl = url;
            // Issue #175
            // TODO: set a timer to guard driver.get timeout, then retry 3 times 201607
            const TIMEOUT = 60 * 1000;
            let ttl = 3;
            while (ttl--) {
                config_1.log.verbose('PuppetWebBrowser', 'open() begin for ttl:%d', ttl);
                try {
                    yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                        const timer = setTimeout((_) => __awaiter(this, void 0, void 0, function* () {
                            try {
                                yield this.driver.close();
                                yield this.driver.quit();
                                yield this.driver.init();
                                config_1.log.verbose('PuppetWebBrowser', 'open() driver.{close,quit,init}() done');
                            }
                            catch (e) {
                                config_1.log.warn('PuppetWebBrowser', 'open() timeout, close driver exception: %s', e.message);
                            }
                            const e = new Error('timeout after '
                                + Math.round(TIMEOUT / 1000) + ' seconds'
                                + 'at ttl:' + ttl);
                            reject(e);
                        }), TIMEOUT);
                        try {
                            yield this.driver.get(openUrl);
                            resolve();
                        }
                        catch (e) {
                            reject(e);
                        }
                        finally {
                            clearTimeout(timer);
                        }
                    }));
                    // open successful!
                    config_1.log.verbose('PuppetWebBrowser', 'open() end at ttl:%d', ttl);
                    return;
                }
                catch (e) {
                    config_1.log.error('PuppetWebBrowser', 'open() exception: %s', e.message);
                }
            }
            throw new Error('open fail because ttl expired');
        });
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('PuppetWebBrowser', 'refresh()');
            yield this.driver
                .navigate()
                .refresh();
            return;
        });
    }
    restart() {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('PuppetWebBrowser', 'restart()');
            yield this.quit();
            if (this.state.current() === 'open' && this.state.inprocess()) {
                config_1.log.warn('PuppetWebBrowser', 'restart() found state.current() === open and inprocess() after quit()!');
                return;
            }
            yield this.init();
        });
    }
    quit() {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('PuppetWebBrowser', 'quit()');
            if (this.state.current() === 'close') {
                let e;
                if (this.state.inprocess()) {
                    e = new Error('quit() fail: on a browser with state.current():`close` and inprocess():`true` ?');
                }
                else {
                    e = new Error('quit() fail: on a already quit-ed browser');
                }
                config_1.log.warn('PuppetWebBrowser', e.message);
                throw e;
            }
            this.state.target('close');
            this.state.current('close', false);
            try {
                yield this.driver.close()
                    .catch(e => { }); // http://stackoverflow.com/a/32341885/1123955
                config_1.log.silly('PuppetWebBrowser', 'quit() driver.close() done');
                yield this.driver.quit()
                    .catch(e => config_1.log.error('PuppetWebBrowser', 'quit() this.driver.quit() exception %s', e.message));
                config_1.log.silly('PuppetWebBrowser', 'quit() driver.quit() done');
                /**
                 *
                 * if we use AVA test runner, then this.clean might cause problems
                 * because there will be more than one instance of browser with the same nodejs process id
                 *
                 */
                try {
                    yield this.clean();
                }
                catch (e) {
                    yield this.clean(true);
                }
            }
            catch (e) {
                // log.warn('PuppetWebBrowser', 'err: %s %s %s %s', e.code, e.errno, e.syscall, e.message)
                config_1.log.warn('PuppetWebBrowser', 'quit() exception: %s', e.message);
                const crashMsgs = [
                    'ECONNREFUSED',
                    'WebDriverError: .* not reachable',
                    'NoSuchWindowError: no such window: target window already closed',
                ];
                const crashRegex = new RegExp(crashMsgs.join('|'), 'i');
                if (crashRegex.test(e.message)) {
                    config_1.log.warn('PuppetWebBrowser', 'driver.quit() browser crashed');
                }
                else {
                    config_1.log.warn('PuppetWebBrowser', 'driver.quit() exception: %s', e.message);
                }
                /* fail safe */
            }
            finally {
                this.state.current('close');
            }
            return;
        });
    }
    clean(kill = false) {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('PuppetWebBrowser', 'clean(kill=%s)', kill);
            const max = 15;
            const backoff = 100;
            /**
             * issue #86 to kill orphan browser process
             */
            if (kill) {
                const pidList = yield this.getBrowserPidList();
                config_1.log.verbose('PuppetWebBrowser', 'clean() %d browsers will be killed', pidList.length);
                pidList.forEach(pid => {
                    try {
                        process.kill(pid, 'SIGKILL');
                    }
                    catch (e) {
                        config_1.log.warn('PuppetWebBrowser', 'clean(kill=true) process.kill(%d, SIGKILL) exception: %s', pid, e.message);
                    }
                });
            }
            /**
             * max = (2*totalTime/backoff) ^ (1/2)
             * timeout = 45000 for {max: 30, backoff: 100}
             * timeout = 11250 for {max: 15, backoff: 100}
             */
            const timeout = max * (backoff * max) / 2;
            return retryPromise({ max, backoff }, (attempt) => __awaiter(this, void 0, void 0, function* () {
                config_1.log.silly('PuppetWebBrowser', 'clean() retryPromise: attempt %s time for timeout %s', attempt, timeout);
                const pidList = yield this.getBrowserPidList();
                if (pidList.length > 0) {
                    throw new Error('browser number: ' + pidList.length);
                }
            }));
        });
    }
    getBrowserPidList() {
        config_1.log.verbose('PuppetWebBrowser', 'getBrowserPidList()');
        const head = this.setting.head;
        return new Promise((resolve, reject) => {
            /**
             * Reject
             */
            const timer = setTimeout(() => {
                const e = new Error('clean() psTree() timeout.');
                config_1.log.error('PuppetWebBrowser', e.message);
                reject(e);
            }, 10 * 1000);
            psTree(process.pid, (err, children) => {
                if (err) {
                    config_1.log.error('PuppetWebBrowser', 'getBrowserPidList() %s', err.message || err);
                    reject(err);
                    return;
                }
                let browserRe;
                switch (head) {
                    case 'phantomjs':
                        browserRe = 'phantomjs';
                        break;
                    case 'chrome':
                        browserRe = 'chrome(?!driver)|chromium';
                        break;
                    default:
                        const e = new Error('unsupported head: ' + head);
                        config_1.log.warn('PuppetWebBrowser', 'getBrowserPids() for %s', e.message);
                        throw e;
                }
                const matchRegex = new RegExp(browserRe, 'i');
                const pids = children.filter(child => {
                    // https://github.com/indexzero/ps-tree/issues/18
                    if (matchRegex.test('' + child.COMMAND + child.COMM)) {
                        config_1.log.silly('PuppetWebBrowser', 'getBrowserPids() child: %s', JSON.stringify(child));
                        return true;
                    }
                    return false;
                }).map(child => child.PID);
                /**
                 * Resolve
                 */
                clearTimeout(timer);
                resolve(pids);
                return;
            });
        });
    }
    execute(script, ...args) {
        return __awaiter(this, arguments, void 0, function* () {
            config_1.log.silly('PuppetWebBrowser', 'Browser.execute("%s")', (script.slice(0, 80)
                .replace(/[\n\s]+/g, ' ')
                + (script.length > 80 ? ' ... ' : '')));
            // log.verbose('PuppetWebBrowser', `Browser.execute() driver.getSession: %s`, util.inspect(this.driver.getSession()))
            if (this.dead()) {
                const e = new Error('Browser.execute() browser dead');
                config_1.log.warn('PuppetWebBrowser', 'execute() this.dead() %s', e.stack);
                throw e;
            }
            let ret;
            try {
                ret = yield this.driver.executeScript.apply(this.driver, arguments);
            }
            catch (e) {
                // this.dead(e)
                config_1.log.warn('PuppetWebBrowser', 'execute() exception: %s, %s', e.message.substr(0, 99), e.stack);
                config_1.log.silly('PuppetWebBrowser', 'execute() script: %s', script);
                throw e;
            }
            return ret;
        });
    }
    executeAsync(script, ...args) {
        return __awaiter(this, arguments, void 0, function* () {
            config_1.log.silly('PuppetWebBrowser', 'Browser.executeAsync(%s)', script.slice(0, 80));
            if (this.dead()) {
                throw new Error('browser dead');
            }
            try {
                return yield this.driver.executeAsyncScript.apply(this.driver, arguments);
            }
            catch (e) {
                // this.dead(e)
                config_1.log.warn('PuppetWebBrowser', 'executeAsync() exception: %s', e.message.slice(0, 99));
                throw e;
            }
        });
    }
    /**
     *
     * check whether browser is full functional
     *
     */
    readyLive() {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('PuppetWebBrowser', 'readyLive()');
            if (this.dead()) {
                config_1.log.silly('PuppetWebBrowser', 'readyLive() dead() is true');
                return false;
            }
            let two;
            try {
                two = yield this.execute('return 1+1');
            }
            catch (e) {
                two = e && e.message;
            }
            if (two === 2) {
                return true; // browser ok, living
            }
            const errMsg = 'found dead browser coz 1+1 = ' + two + ' (not 2)';
            config_1.log.warn('PuppetWebBrowser', 'readyLive() %s', errMsg);
            this.dead(errMsg);
            return false; // browser not ok, dead
        });
    }
    dead(forceReason) {
        // too noisy!
        // log.silly('PuppetWebBrowser', 'dead() checking ... ')
        if (this.state.target() === 'close'
            || this.state.current() === 'close') {
            config_1.log.verbose('PuppetWebBrowser', 'dead() state target(%s) current(%s) stable(%s)', this.state.target(), this.state.current(), this.state.stable());
            config_1.log.verbose('PuppetWebBrowser', 'dead() browser is in dead state');
            return true;
        }
        let msg;
        let dead = false;
        if (forceReason) {
            dead = true;
            msg = forceReason;
            config_1.log.verbose('PuppetWebBrowser', 'dead(forceReason=%s) %s', forceReason, new Error().stack);
        }
        else if (!this.driver) {
            dead = true;
            msg = 'no driver or session';
        }
        if (dead) {
            config_1.log.warn('PuppetWebBrowser', 'dead(%s) because %s', forceReason
                ? forceReason
                : '', msg);
            if (this.state.target() === 'open'
                && this.state.current() === 'open'
                && this.state.stable()) {
                config_1.log.verbose('PuppetWebBrowser', 'dead() emit a `dead` event because %s', msg);
                this.emit('dead', msg);
            }
            else {
                config_1.log.warn('PuppetWebBrowser', 'dead() wil not emit `dead` event because states are: target(%s), current(%s), stable(%s)', this.state.target(), this.state.current(), this.state.stable());
            }
        }
        return dead;
    }
    addCookie(cookie) {
        return this.cookie.add(cookie);
    }
    saveCookie() { return this.cookie.save(); }
    loadCookie() { return this.cookie.load(); }
    readCookie() { return this.cookie.read(); }
    cleanCookie() { return this.cookie.clean(); }
}
exports.Browser = Browser;
exports.default = Browser;
//# sourceMappingURL=browser.js.map