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
const ava_1 = require("ava");
const browser_1 = require("./browser");
ava_1.test.serial('quit()', (t) => __awaiter(this, void 0, void 0, function* () {
    const browser = new browser_1.Browser();
    yield browser.driver.init(); // init driver, not init browser
    t.throws(browser.quit(), Error, 'should throw on an un-inited browser');
    browser.state.target('open');
    browser.state.current('open', false);
    t.notThrows(browser.quit(), 'should not throw exception when call quit() on an `inprocess` `open` state browser');
    browser.state.target('close');
    browser.state.current('close');
    t.throws(browser.quit(), Error, 'should throw exception when call quit() twice on browser');
}));
ava_1.test.serial('init()', (t) => __awaiter(this, void 0, void 0, function* () {
    const browser = new browser_1.Browser();
    browser.state.target('open');
    browser.state.current('open');
    t.throws(browser.init(), Error, 'should throw exception when call init() on an `open` state browser');
    browser.state.current('open', false);
    t.throws(browser.init(), Error, 'should throw exception when call init() on a `open`-`ing` state browser');
    yield browser.quit();
    t.pass('should quited browser');
}));
//# sourceMappingURL=browser.spec.js.map