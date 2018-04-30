"use strict";
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
const fs = require("fs");
// import { execSync } from 'child_process'
// import * as sinon from 'sinon'
const config_1 = require("../src/config");
/**
 * need keep this !Config.dockerMode because ava need at least one test() inside.
 *   × No tests found in test\docker.spec.js
 */
if (config_1.default.dockerMode) {
    ava_1.test('Docker smoke testing', function (t) {
        // const n = execSync('ps a | grep Xvfb | grep -v grep | wc -l').toString().replace(/\n/, '', 'g')
        // t.is(parseInt(n), 1, 'should has Xvfb started')
        t.notThrows(() => {
            // fs.accessSync(Config.CMD_CHROMIUM, fs['X_OK'])
            fs.statSync(config_1.default.CMD_CHROMIUM).isFile();
        }, 'should exist xvfb-chrome exectable');
    });
}
else {
    ava_1.test('Docker test skipped', function (t) {
        t.pass('not in docker. this test is to prevent AVA `× No tests found in test\docker.spec.js` error.');
    });
}
//# sourceMappingURL=docker.spec.js.map