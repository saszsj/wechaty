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
// import { log }  from '../src/config'
const sinon_1 = require("sinon");
ava_1.test('Node.js function params destructuring behaviour test', t => {
    const DEFAULT_N = 1;
    const DEFAULT_S = 't';
    const paramSpy = sinon_1.spy();
    function paramTest({ n = DEFAULT_N, s = DEFAULT_S, } = {}) {
        paramSpy(n, s);
    }
    paramSpy.reset();
    paramTest();
    t.deepEqual(paramSpy.args[0], [DEFAULT_N, DEFAULT_S], 'should be equal to default args');
    paramSpy.reset();
    paramTest({ n: 42 });
    t.deepEqual(paramSpy.args[0], [42, DEFAULT_S], 'should be equal to default s args');
    paramSpy.reset();
    paramTest({ s: 'life' });
    t.deepEqual(paramSpy.args[0], [DEFAULT_N, 'life'], 'should be equal to default n args');
});
//# sourceMappingURL=node.spec.js.map