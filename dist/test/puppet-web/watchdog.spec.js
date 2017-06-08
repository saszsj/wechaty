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
const sinon = require("sinon");
/* tslint:disable:no-var-requires */
const retryPromise = require('retry-promise').default;
const config_1 = require("../../src/config");
const _1 = require("../../src/puppet-web/");
const PROFILE = 'unit-test-session.wechaty.json';
process.on('unhandledRejection', (reason, p) => {
    console.log('!!!!!!! unhandledRejection in watchdog.spec.ts');
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    console.log('!!!!!!!');
});
ava_1.test('timer', (t) => __awaiter(this, void 0, void 0, function* () {
    const pw = new _1.PuppetWeb({ profile: PROFILE });
    t.truthy(pw, 'should instantiate a PuppetWeb');
    try {
        pw.addListener('error', failOnUnexpectedErrorEvent);
        yield pw.init();
        _1.Watchdog.onFeed.call(pw, { data: 'initing directly from test' });
        t.pass('should ok with default food type');
        yield pw.quit();
        pw.state.target('live');
        pw.browser.state.target('open');
        const savedLevel = config_1.log.level();
        if (config_1.log.level() === 'info') {
            config_1.log.level('silent');
            t.pass('set log.level = silent to mute log when watchDog reset wechaty temporary');
        }
        {
            pw.removeListener('error', failOnUnexpectedErrorEvent);
            t.is(pw.state.target(), 'live', 'puppet web should at target  state `live`');
            t.is(pw.state.current(), 'dead', 'puppet web should at current state `dead`');
            t.true(pw.state.stable(), 'puppet web state should stable');
            const spy = sinon.spy();
            pw.once('error', spy);
            pw.emit('watchdog', {
                data: 'active_for_timeout_1ms',
                timeout: 1,
            });
            yield new Promise(resolve => setTimeout(resolve, 10)); // wait until reset
            t.truthy(spy.calledOnce, 'should get event[error] after watchdog timeout');
            pw.addListener('error', failOnUnexpectedErrorEvent);
        }
        const EXPECTED_DING_DATA = 'dingdong';
        pw.emit('watchdog', { data: 'feed to extend the dog life', timeout: 120000 });
        const dong = yield waitDing(EXPECTED_DING_DATA);
        t.is(dong, EXPECTED_DING_DATA, 'should get EXPECTED_DING_DATA from ding after watchdog reset, and restored log level');
        config_1.log.level(savedLevel);
        yield pw.quit()
            .catch(e => {
            config_1.log.warn('TestPuppetWeb', 'timer last pw.quit() exception: %s', e.message);
        });
        return;
    }
    catch (e) {
        t.fail('exception: ' + e.message + ', ' + e.stack);
    }
    /////////////////////////////////////////////////////////////////////////////
    function waitDing(data) {
        const max = 13;
        const backoff = 1000;
        // max = (2*totalTime/backoff) ^ (1/2)
        // timeout = 11,250 for {max: 15, backoff: 100}
        // timeout = 45,000 for {max: 30, backoff: 100}
        // timeout = 49,000 for {max: 7, backoff: 2000}
        // timeout = 84,500 for {max: 13, backoff: 1000}
        const timeout = max * (backoff * max) / 2;
        return retryPromise({ max, backoff }, function (attempt) {
            return __awaiter(this, void 0, void 0, function* () {
                config_1.log.silly('TestPuppetWeb', 'waitDing() retryPromise: attampt %s/%s time for timeout %s', attempt, max, timeout);
                try {
                    const r = yield pw.ding(data);
                    if (!r) {
                        throw new Error('got empty return');
                    }
                    return r;
                }
                catch (e) {
                    config_1.log.verbose('TestPuppetWeb', 'waitDing() exception: %s', e.message);
                    throw e;
                }
            });
        })
            .catch(e => {
            config_1.log.error('TestPuppetWeb', 'retryPromise() waitDing() finally FAIL: %s', e.message);
            throw e;
        });
    }
    function failOnUnexpectedErrorEvent(e) {
        t.fail('should not get unexpected `error` event: ' + e.message + ', ' + e.stack);
    }
}));
//# sourceMappingURL=watchdog.spec.js.map