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
const selenium_webdriver_1 = require("selenium-webdriver");
const config_1 = require("../config");
/**
 * ISSUE #72
 * Introduce the SELENIUM_PROMISE_MANAGER environment variable.
 * When set to 1, selenium-webdriver will use the existing ControlFlow scheduler.
 * When set to 0, the SimpleScheduler will be used.
 */
process.env['SELENIUM_PROMISE_MANAGER'] = 0;
selenium_webdriver_1.promise.USE_PROMISE_MANAGER = false;
class BrowserDriver {
    constructor(head) {
        this.head = head;
        config_1.log.verbose('PuppetWebBrowserDriver', 'constructor(%s)', head);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('PuppetWebBrowserDriver', 'init() for head: %s', this.head);
            switch (this.head) {
                case 'phantomjs':
                    this.driver = yield this.getPhantomJsDriver();
                    break;
                case 'firefox':
                    this.driver = new selenium_webdriver_1.Builder()
                        .setAlertBehavior('ignore')
                        .forBrowser('firefox')
                        .build();
                    break;
                case 'chrome':
                    this.driver = yield this.getChromeDriver();
                    break;
                default:
                    throw new Error('unsupported head: ' + this.head);
            }
            const WEBDRIVER_TIMEOUT = 60 * 1000;
            yield this.driver.manage()
                .timeouts()
                .setScriptTimeout(WEBDRIVER_TIMEOUT);
        });
    }
    getWebDriver() {
        return this.driver;
    }
    getChromeDriver() {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('PuppetWebBrowserDriver', 'getChromeDriver()');
            /**
             * http://stackoverflow.com/a/27733960/1123955
             * issue #56
             * only need under win32 with cygwin
             * and will cause strange error:
             *
             */
            /*
            const chrome  = require('selenium-webdriver/chrome')
            const path    = require('chromedriver').path
        
            const service = new chrome.ServiceBuilder(path).build()
            try {
              chrome.setDefaultService(service)
            } catch (e) { // fail safe
               // `The previously configured ChromeDriver service is still running.`
               // `You must shut it down before you may adjust its configuration.`
            }
           */
            const options = {
                args: [
                    '--homepage=about:blank',
                    '--no-sandbox',
                ],
            };
            if (config_1.config.dockerMode) {
                config_1.log.verbose('PuppetWebBrowserDriver', 'getChromeDriver() wechaty in docker confirmed(should not show this in CI)');
                options['binary'] = config_1.config.CMD_CHROMIUM;
            }
            else {
                /**
                 * https://github.com/Chatie/wechaty/pull/416
                 * In some circumstances, ChromeDriver could not be found on the current PATH when not in Docker.
                 * The chromedriver package always adds directory of chrome driver binary to PATH.
                 * So we requires chromedriver here to avoid PATH issue.
                 */
                require('chromedriver');
            }
            const customChrome = selenium_webdriver_1.Capabilities
                .chrome()
                .set('chromeOptions', options);
            // TODO: chromedriver --silent
            if (!/^(verbose|silly)$/i.test(config_1.log.level())) {
                const prefs = new selenium_webdriver_1.logging.Preferences();
                prefs.setLevel(selenium_webdriver_1.logging.Type.BROWSER, selenium_webdriver_1.logging.Level.OFF);
                prefs.setLevel(selenium_webdriver_1.logging.Type.CLIENT, selenium_webdriver_1.logging.Level.OFF);
                prefs.setLevel(selenium_webdriver_1.logging.Type.DRIVER, selenium_webdriver_1.logging.Level.OFF);
                prefs.setLevel(selenium_webdriver_1.logging.Type.PERFORMANCE, selenium_webdriver_1.logging.Level.OFF);
                prefs.setLevel(selenium_webdriver_1.logging.Type.SERVER, selenium_webdriver_1.logging.Level.OFF);
                customChrome.setLoggingPrefs(prefs);
            }
            /**
             * XXX when will Builder().build() throw exception???
             */
            let ttl = 3;
            let driverError = new Error('getChromeDriver() unknown invalid driver error');
            let valid = false;
            let driver;
            while (ttl--) {
                config_1.log.verbose('PuppetWebBrowserDriver', 'getChromeDriver() ttl: %d', ttl);
                try {
                    config_1.log.verbose('PuppetWebBrowserDriver', 'getChromeDriver() new Builder()');
                    driver = new selenium_webdriver_1.Builder()
                        .setAlertBehavior('ignore')
                        .forBrowser('chrome')
                        .withCapabilities(customChrome)
                        .build();
                    config_1.log.verbose('PuppetWebBrowserDriver', 'getChromeDriver() new Builder() done');
                    valid = yield this.valid(driver);
                    config_1.log.verbose('PuppetWebBrowserDriver', 'getChromeDriver() valid() is %s at ttl %d', valid, ttl);
                    if (valid) {
                        config_1.log.silly('PuppetWebBrowserDriver', 'getChromeDriver() success');
                        return driver;
                    }
                    else {
                        const e = new Error('got invalid driver at ttl ' + ttl);
                        config_1.log.warn('PuppetWebBrowserDriver', 'getChromeDriver() %s', e.message);
                        driverError = e;
                        config_1.log.verbose('PuppetWebBrowserDriver', 'getChromeDriver() driver.quit() at ttl %d', ttl);
                        driver.quit() // do not await, because a invalid driver will always hang when quit()
                            .catch(err => {
                            config_1.log.warn('PuppetWebBrowserDriver', 'getChromeDriver() driver.quit() exception: %s', err.message);
                            driverError = err;
                        });
                    } // END if
                }
                catch (e) {
                    if (/could not be found/.test(e.message)) {
                        // The ChromeDriver could not be found on the current PATH
                        config_1.log.error('PuppetWebBrowserDriver', 'getChromeDriver() Wechaty require `chromedriver` to be installed.(try to run: "npm install chromedriver" to fix this issue)');
                        throw e;
                    }
                    config_1.log.warn('PuppetWebBrowserDriver', 'getChromeDriver() ttl:%d exception: %s', ttl, e.message);
                    driverError = e;
                }
            } // END while
            config_1.log.warn('PuppetWebBrowserDriver', 'getChromeDriver() invalid after ttl expired: %s', driverError.stack);
            throw driverError;
        });
    }
    getPhantomJsDriver() {
        return __awaiter(this, void 0, void 0, function* () {
            // setup custom phantomJS capability https://github.com/SeleniumHQ/selenium/issues/2069
            const phantomjsExe = require('phantomjs-prebuilt').path;
            if (!phantomjsExe) {
                throw new Error('phantomjs binary path not found');
            }
            // const phantomjsExe = require('phantomjs2').path
            const phantomjsArgs = [
                '--load-images=false',
                '--ignore-ssl-errors=true',
                '--web-security=false',
                '--ssl-protocol=any',
            ];
            if (config_1.config.debug) {
                phantomjsArgs.push('--remote-debugger-port=8080'); // XXX: be careful when in production env.
                phantomjsArgs.push('--webdriver-loglevel=DEBUG');
                // phantomjsArgs.push('--webdriver-logfile=webdriver.debug.log')
            }
            else {
                if (config_1.log && config_1.log.level() === 'silent') {
                    phantomjsArgs.push('--webdriver-loglevel=NONE');
                }
                else {
                    phantomjsArgs.push('--webdriver-loglevel=ERROR');
                }
            }
            const customPhantom = selenium_webdriver_1.Capabilities.phantomjs()
                .setAlertBehavior('ignore')
                .set('phantomjs.binary.path', phantomjsExe)
                .set('phantomjs.cli.args', phantomjsArgs);
            config_1.log.silly('PuppetWebBrowserDriver', 'phantomjs binary: ' + phantomjsExe);
            config_1.log.silly('PuppetWebBrowserDriver', 'phantomjs args: ' + phantomjsArgs.join(' '));
            const driver = new selenium_webdriver_1.Builder()
                .withCapabilities(customPhantom)
                .build();
            // const valid = await this.valid(driver)
            // if (!valid) {
            //   throw new Error('invalid driver founded')
            // }
            /* tslint:disable:jsdoc-format */
            /**
             *  FIXME: ISSUE #21 - https://github.com/zixia/wechaty/issues/21
             *
             *	http://phantomjs.org/api/webpage/handler/on-resource-requested.html
             *	http://stackoverflow.com/a/29544970/1123955
             *  https://github.com/geeeeeeeeek/electronic-wechat/pull/319
             *
             */
            //   	driver.executePhantomJS(`
            // this.onResourceRequested = function(request, net) {
            //    console.log('REQUEST ' + request.url);
            //    blockRe = /wx\.qq\.com\/\?t=v2\/fake/i
            //    if (blockRe.test(request.url)) {
            //        console.log('Abort ' + request.url);
            //        net.abort();
            //    }
            // }
            // `)
            // https://github.com/detro/ghostdriver/blob/f976007a431e634a3ca981eea743a2686ebed38e/src/session.js#L233
            // driver.manage().timeouts().pageLoadTimeout(2000)
            return driver;
        });
    }
    valid(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('PuppetWebBrowserDriver', 'valid()');
            if (!(yield this.validDriverSession(driver))) {
                return false;
            }
            if (!(yield this.validDriverExecute(driver))) {
                return false;
            }
            return true;
        });
    }
    validDriverExecute(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('PuppetWebBrowserDriver', 'validDriverExecute()');
            try {
                const two = yield driver.executeScript('return 1+1');
                config_1.log.verbose('PuppetWebBrowserDriver', 'validDriverExecute() driver.executeScript() done: two = %s', two);
                if (two === 2) {
                    config_1.log.silly('PuppetWebBrowserDriver', 'validDriverExecute() driver ok');
                    return true;
                }
                else {
                    config_1.log.warn('PuppetWebBrowserDriver', 'validDriverExecute() fail: two = %s ?', two);
                    return false;
                }
            }
            catch (e) {
                config_1.log.warn('BrowserDriver', 'validDriverExecute() fail: %s', e.message);
                return false;
            }
        });
    }
    validDriverSession(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('PuppetWebBrowserDriver', 'validDriverSession()');
            try {
                const session = yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    /**
                     * Be careful about this TIMEOUT, the total time(TIMEOUT x retry) should not trigger Watchdog Reset
                     * because we are in state(open, false) state, which will cause Watchdog Reset failure.
                     * https://travis-ci.org/wechaty/wechaty/jobs/179022657#L3246
                     */
                    const TIMEOUT = 7 * 1000;
                    let timer;
                    timer = setTimeout(_ => {
                        const e = new Error('validDriverSession() driver.getSession() timeout(halt?)');
                        config_1.log.warn('PuppetWebBrowserDriver', e.message);
                        // record timeout by set timer to null
                        timer = null;
                        // 1. Promise rejected
                        return reject(e);
                    }, TIMEOUT);
                    try {
                        config_1.log.verbose('PuppetWebBrowserDriver', 'validDriverSession() getSession()');
                        const driverSession = yield driver.getSession();
                        config_1.log.verbose('PuppetWebBrowserDriver', 'validDriverSession() getSession() done');
                        // 3. Promise resolved
                        return resolve(driverSession);
                    }
                    catch (e) {
                        config_1.log.warn('PuppetWebBrowserDriver', 'validDriverSession() getSession() catch() rejected: %s', e && e.message || e);
                        // 4. Promise rejected
                        return reject(e);
                    }
                    finally {
                        if (timer) {
                            config_1.log.verbose('PuppetWebBrowserDriver', 'validDriverSession() getSession() clearing timer');
                            clearTimeout(timer);
                            timer = null;
                        }
                    }
                }));
                config_1.log.verbose('PuppetWebBrowserDriver', 'validDriverSession() driver.getSession() done()');
                if (session) {
                    return true;
                }
                else {
                    config_1.log.verbose('PuppetWebBrowserDriver', 'validDriverSession() found an invalid driver');
                    return false;
                }
            }
            catch (e) {
                config_1.log.warn('PuppetWebBrowserDriver', 'validDriverSession() driver.getSession() exception: %s', e.message);
                return false;
            }
        });
    }
    close() { return this.driver.close(); }
    executeAsyncScript(script, ...args) { return this.driver.executeAsyncScript.apply(this.driver, arguments); }
    executeScript(script, ...args) { return this.driver.executeScript.apply(this.driver, arguments); }
    get(url) { return this.driver.get(url); }
    getSession() { return this.driver.getSession(); }
    manage() { return this.driver.manage(); }
    navigate() { return this.driver.navigate(); }
    quit() { return this.driver.quit(); }
}
exports.BrowserDriver = BrowserDriver;
// export default BrowserDriver
//# sourceMappingURL=browser-driver.js.map