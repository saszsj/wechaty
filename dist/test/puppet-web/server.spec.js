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
const https = require("https");
const sinon = require("sinon");
const _1 = require("../../src/puppet-web/");
const util_lib_1 = require("../../src/util-lib");
const config_1 = require("../../src/config");
ava_1.test('create & close', (t) => __awaiter(this, void 0, void 0, function* () {
    const port = yield util_lib_1.default.getPort(18788);
    const s = new _1.Server(port);
    t.is(typeof s, 'object', 'PuppetWebServer instance created');
    let httpsServer;
    const spy = sinon.spy();
    const express = s.createExpress();
    t.is(typeof express, 'function', 'create express');
    httpsServer = yield s.createHttpsServer(express);
    t.is(typeof httpsServer, 'object', 'create https server');
    httpsServer.on('close', _ => spy('onClose'));
    const socketio = s.createSocketIo(httpsServer);
    t.is(typeof socketio, 'object', 'should created socket io instance');
    const retClose = yield new Promise((resolve, reject) => {
        ;
        httpsServer.close(_ => {
            spy('closed');
            resolve('closed');
        });
    });
    t.is(retClose, 'closed', 'HttpsServer closed');
    t.truthy(spy.calledTwice, 'spy should be called twice after close HttpsServer');
    t.deepEqual(spy.args[0], ['onClose'], 'should fire event `close` when close HttpsServer');
    t.deepEqual(spy.args[1], ['closed'], 'should run callback when close HttpsServer');
    yield s.quit();
}));
ava_1.test('http ding', (t) => __awaiter(this, void 0, void 0, function* () {
    const port = yield util_lib_1.default.getPort(18788);
    const server = new _1.Server(port);
    t.truthy(server, 'new server instance');
    try {
        yield server.init();
        t.pass('server:' + port + ' inited');
        const retHttps = yield dingHttps();
        t.is(retHttps, 'dong', 'ding https got dong');
        yield server.quit();
    }
    catch (e) {
        t.fail('smoke testing exception: ' + e.message);
        throw e;
    }
    return; // The following is help functions only
    //////////////////////////////////////////
    function dingHttps() {
        const options = require('url').parse(`https://localhost:${port}/ding`);
        options.rejectUnauthorized = false; // permit self-signed CA
        return new Promise((resolve, reject) => {
            https.get(options, res => {
                res.on('data', chunk => {
                    config_1.log.verbose('TestingPuppetWebServer', 'https on data got: ' + chunk.toString());
                    resolve(chunk.toString());
                });
            }).on('error', e => reject('https get error:' + e));
        });
    }
}));
//# sourceMappingURL=server.spec.js.map