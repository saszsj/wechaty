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
const fs = require("fs");
const ava_1 = require("ava");
const _1 = require("../../");
const _2 = require("../../src/puppet-web/");
const PROFILE = _1.Config.DEFAULT_PROFILE + '-' + process.pid + '-';
let profileCounter = 1;
ava_1.test('Cookie smoke testing', (t) => __awaiter(this, void 0, void 0, function* () {
    const browser = new _2.Browser();
    t.truthy(browser, 'should instanciate a browser instance');
    browser.state.target('open');
    browser.hostname = 'wx.qq.com';
    yield browser.driver.init();
    t.pass('should init driver');
    yield browser.open();
    t.pass('should opened');
    browser.state.current('open');
    const two = yield browser.execute('return 1+1');
    t.is(two, 2, 'should got 2 after execute script 1+1');
    let cookies = yield browser.driver.manage().getCookies();
    t.truthy(cookies.length, 'should got plenty of cookies');
    yield browser.driver.manage().deleteAllCookies();
    cookies = yield browser.driver.manage().getCookies();
    t.is(cookies.length, 0, 'should no cookie anymore after deleteAllCookies()');
    const EXPECTED_COOKIES = [{
            name: 'wechaty0',
            value: '8788-0',
            path: '/',
            domain: '.qq.com',
            secure: false,
            expiry: 99999999999999,
        },
        {
            name: 'wechaty1',
            value: '8788-1',
            path: '/',
            domain: '.qq.com',
            secure: false,
            expiry: 99999999999999,
        }];
    yield browser.addCookie(EXPECTED_COOKIES);
    const tt = yield browser.readCookie();
    yield Promise.all(tt);
    cookies = yield browser.driver.manage().getCookies();
    const cookies0 = cookies.filter(c => { return RegExp(EXPECTED_COOKIES[0].name).test(c.name); });
    t.is(cookies0[0].name, EXPECTED_COOKIES[0].name, 'getCookies() should filter out the cookie named wechaty0');
    const cookies1 = cookies.filter(c => { return RegExp(EXPECTED_COOKIES[1].name).test(c.name); });
    t.truthy(cookies1, 'should get cookies1');
    t.is(cookies1[0].name, EXPECTED_COOKIES[1].name, 'getCookies() should filter out the cookie named wechaty1');
    yield browser.open();
    t.pass('re-opened url');
    const cookieAfterOpen = yield browser.driver.manage().getCookie(EXPECTED_COOKIES[0].name);
    t.is(cookieAfterOpen.name, EXPECTED_COOKIES[0].name, 'getCookie() should get expected cookie named after re-open url');
    const dead = browser.dead();
    t.is(dead, false, 'should be a not dead browser');
    const live = yield browser.readyLive();
    t.is(live, true, 'should be a live browser');
    yield browser.driver.quit();
}));
ava_1.test('Cookie save/load', (t) => __awaiter(this, void 0, void 0, function* () {
    const profileName = PROFILE + (profileCounter++);
    let browser = new _2.Browser({
        head: _1.Config.head,
        sessionFile: profileName,
    });
    /**
     * use exception to call b.quit() to clean up
     */
    try {
        t.truthy(browser, 'should get a new Browser');
        browser.state.target('open');
        browser.hostname = 'wx.qq.com';
        yield browser.driver.init();
        t.pass('should init driver');
        yield browser.open();
        t.pass('opened');
        const EXPECTED_COOKIE = {
            name: 'wechaty_save_to_session',
            value: '### This cookie should be saved to session file, and load back at next PuppetWeb init  ###',
            path: '/',
            domain: '.wx.qq.com',
            secure: false,
            expiry: 99999999999999,
        };
        const EXPECTED_NAME_REGEX = new RegExp('^' + EXPECTED_COOKIE.name + '$');
        yield browser.driver.manage().deleteAllCookies();
        const cookies = yield browser.driver.manage().getCookies();
        t.is(cookies.length, 0, 'should no cookie after deleteAllCookies()');
        yield browser.addCookie(EXPECTED_COOKIE);
        const cookieFromBrowser = yield browser.driver.manage().getCookie(EXPECTED_COOKIE.name);
        t.is(cookieFromBrowser.name, EXPECTED_COOKIE.name, 'cookie from getCookie() should be same as we just set');
        let cookiesFromCheck = yield browser.readCookie();
        t.truthy(cookiesFromCheck.length, 'should get cookies from checkSession() after addCookies()');
        let cookieFromCheck = cookiesFromCheck.filter(c => EXPECTED_NAME_REGEX.test(c['name']));
        t.is(cookieFromCheck[0]['name'], EXPECTED_COOKIE.name, 'cookie from checkSession() return should be same as we just set by addCookies()');
        yield browser.saveCookie();
        const cookiesFromSave = yield browser.readCookie();
        t.truthy(cookiesFromSave.length, 'should get cookies from saveSession()');
        const cookieFromSave = cookiesFromSave.filter(c => EXPECTED_NAME_REGEX.test(c['name']));
        t.is(cookieFromSave.length, 1, 'should has the cookie we just set');
        t.is(cookieFromSave[0]['name'], EXPECTED_COOKIE.name, 'cookie from saveSession() return should be same as we just set');
        yield browser.driver.manage().deleteAllCookies();
        cookiesFromCheck = yield browser.readCookie();
        t.is(cookiesFromCheck.length, 0, 'should no cookie from checkSession() after deleteAllCookies()');
        yield browser.loadCookie().catch(() => { });
        const cookiesFromLoad = yield browser.readCookie();
        t.truthy(cookiesFromLoad.length, 'should get cookies after loadSession()');
        const cookieFromLoad = cookiesFromLoad.filter(c => EXPECTED_NAME_REGEX.test(c.name));
        t.is(cookieFromLoad[0].name, EXPECTED_COOKIE.name, 'cookie from loadSession() should has expected cookie');
        cookiesFromCheck = yield browser.readCookie();
        t.truthy(cookiesFromCheck.length, 'should get cookies from checkSession() after loadSession()');
        cookieFromCheck = cookiesFromCheck.filter(c => EXPECTED_NAME_REGEX.test(c['name']));
        t.truthy(cookieFromCheck.length, 'should has cookie after filtered after loadSession()');
        t.is(cookieFromCheck[0]['name'], EXPECTED_COOKIE.name, 'cookie from checkSession() return should has expected cookie after loadSession');
        yield browser.driver.quit();
        t.pass('quited');
        /**
         * start new browser process
         * with the same sessionFile: profileName
         */
        browser = new _2.Browser({
            head: _1.Config.head,
            sessionFile: profileName,
        });
        t.pass('should started a new Browser');
        browser.state.target('open');
        browser.hostname = 'wx.qq.com';
        yield browser.driver.init();
        t.pass('should inited the new Browser');
        yield browser.open();
        t.pass('should opened');
        yield browser.loadCookie();
        t.pass('should loadSession for new Browser(process)');
        const cookieAfterQuit = yield browser.driver.manage().getCookie(EXPECTED_COOKIE.name);
        t.truthy(cookieAfterQuit, 'should get cookie from getCookie()');
        t.is(cookieAfterQuit.name, EXPECTED_COOKIE.name, 'cookie from getCookie() after browser quit, should load the right cookie back');
        fs.unlink(profileName, err => {
            if (err) {
                _1.log.warn('Browser', 'unlink session file %s fail: %s', PROFILE, err);
            }
        });
        yield browser.driver.quit();
    }
    catch (e) {
        if (browser) {
            yield browser.driver.quit();
        }
        t.fail('exception: ' + e.message);
    }
}));
//# sourceMappingURL=browser.spec.js.map