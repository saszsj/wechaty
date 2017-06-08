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
const _1 = require("../../src/puppet-web/");
// const PORT = process.env.WECHATY_PORT || 58788
const PROFILE = 'unit-test-session.wechaty.json';
ava_1.test('Puppet Web Event smoke testing', (t) => __awaiter(this, void 0, void 0, function* () {
    const pw = new _1.PuppetWeb({ profile: PROFILE });
    t.truthy(pw, 'should instantiated a PuppetWeb');
    try {
        yield pw.init();
        t.pass('should be inited');
        yield _1.Event.onBrowserDead.call(pw, 'event unit test');
        t.pass('should finish onBrowserDead event process');
        yield pw.quit();
    }
    catch (e) {
        t.fail('exception: ' + e.message);
    }
}));
//# sourceMappingURL=event.spec.js.map