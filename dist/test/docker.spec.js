"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Wechaty - Wechat for Bot. Connecting ChatBots
 *
 * Licenst: ISC
 * https://github.com/wechaty/wechaty
 *
 */
const ava_1 = require("ava");
const fs = require("fs");
// import { execSync } from 'child_process'
// import * as sinon from 'sinon'
const config_1 = require("../src/config");
/**
 * need keep this !Config.isDocker because ava need at least one test() inside.
 *   × No tests found in test\docker.spec.js
 */
if (config_1.default.isDocker) {
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