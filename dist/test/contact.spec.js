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
const config_1 = require("../src/config");
const contact_1 = require("../src/contact");
const puppet_web_1 = require("../src/puppet-web");
config_1.default.puppetInstance(new puppet_web_1.default());
ava_1.test('Contact smoke testing', (t) => __awaiter(this, void 0, void 0, function* () {
    /* tslint:disable:variable-name */
    const UserName = '@0bb3e4dd746fdbd4a80546aef66f4085';
    const NickName = 'NickNameTest';
    const RemarkName = 'AliasTest';
    // Mock
    const mockContactGetter = function (id) {
        return new Promise((resolve, reject) => {
            if (id !== UserName)
                return resolve({});
            setTimeout(() => {
                return resolve({
                    UserName: UserName,
                    NickName: NickName,
                    RemarkName: RemarkName,
                });
            }, 200);
        });
    };
    const c = new contact_1.default(UserName);
    t.is(c.id, UserName, 'id/UserName right');
    const r = yield c.ready(mockContactGetter);
    t.is(r.get('id'), UserName, 'UserName set');
    t.is(r.get('name'), NickName, 'NickName set');
    t.is(r.name(), NickName, 'should get the right name from Contact');
    t.is(r.alias(), RemarkName, 'should get the right alias from Contact');
    const s = r.toString();
    t.is(typeof s, 'string', 'toString()');
    // const contact1 = await Contact.find({name: 'NickNameTest'})
    // t.is(contact1.id, UserName, 'should find contact by name')
    // const contact2 = await Contact.find({alias: 'AliasTest'})
    // t.is(contact2.id, UserName, 'should find contact by alias')
}));
//# sourceMappingURL=contact.spec.js.map