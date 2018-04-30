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
const config_1 = require("../../src/config");
const puppet_web_1 = require("../../src/puppet-web");
/**
 * the reason why use `test.serial` here is:
 *  static variable `Contact.puppet` will be changed
 *  when `PuppteWeb.init()` and `PuppteWeb.quit()`
 */
ava_1.test.serial('login/logout events', (t) => __awaiter(this, void 0, void 0, function* () {
    const pw = new puppet_web_1.default();
    t.truthy(pw, 'should instantiated a PuppetWeb');
    config_1.config.puppetInstance(pw);
    yield pw.init();
    t.pass('should be inited');
    t.is(pw.logined(), false, 'should be not logined');
    // XXX find a better way to mock...
    pw.bridge.getUserName = function () { return Promise.resolve('mockedUserName'); };
    pw.getContact = function () { return Promise.resolve('dummy'); };
    const loginPromise = new Promise((res, rej) => pw.once('login', _ => res('loginFired')));
    pw.server.emit('login');
    t.is(yield loginPromise, 'loginFired', 'should fired login event');
    t.is(pw.logined(), true, 'should be logined');
    const logoutPromise = new Promise((res, rej) => pw.once('logout', _ => res('logoutFired')));
    pw.server.emit('logout');
    t.is(yield logoutPromise, 'logoutFired', 'should fire logout event');
    t.is(pw.logined(), false, 'should be logouted');
    yield pw.quit();
}));
ava_1.test.serial('server/browser socketio ding', (t) => __awaiter(this, void 0, void 0, function* () {
    const puppet = new puppet_web_1.default();
    t.truthy(puppet, 'should instantiated a PuppetWeb');
    config_1.config.puppetInstance(puppet);
    const EXPECTED_DING_DATA = 'dingdong';
    try {
        yield puppet.init();
        t.pass('should be inited');
        const ret = yield dingSocket(puppet.server);
        t.is(ret, EXPECTED_DING_DATA, 'should got EXPECTED_DING_DATA after resolved dingSocket()');
    }
    catch (e) {
        t.fail(e && e.message || e || 'unknown exception???');
    }
    try {
        yield puppet.quit();
    }
    catch (err) {
        t.fail(err.message);
    }
    return;
    /////////////////////////////////////////////////////////////////////////////
    function dingSocket(server) {
        const maxTime = 60000; // 60s
        const waitTime = 3000;
        let totalTime = 0;
        return new Promise((resolve, reject) => {
            config_1.log.verbose('TestPuppetWeb', 'dingSocket()');
            const timeoutTimer = setTimeout(_ => {
                reject('dingSocket() no response timeout after ' + 2 * maxTime);
            }, 2 * maxTime);
            timeoutTimer.unref();
            testDing();
            return;
            function testDing() {
                config_1.log.silly('TestPuppetWeb', 'dingSocket() server.socketServer: %s', server.socketServer);
                if (!server.socketClient) {
                    totalTime += waitTime;
                    if (totalTime > maxTime) {
                        return reject('testDing() timeout after ' + totalTime + 'ms');
                    }
                    config_1.log.silly('TestPuppetWeb', 'waiting socketClient to connect for ' + totalTime + '/' + maxTime + ' ms...');
                    setTimeout(testDing, waitTime);
                    return;
                }
                config_1.log.silly('TestPuppetWeb', 'dingSocket() server.socketClient: %s', server.socketClient);
                server.socketClient.once('dong', data => {
                    config_1.log.verbose('TestPuppetWeb', 'socket recv event dong: ' + data);
                    clearTimeout(timeoutTimer);
                    return resolve(data);
                });
                server.socketClient.emit('ding', EXPECTED_DING_DATA);
            }
        });
    }
}));
//# sourceMappingURL=puppet-web.spec.js.map