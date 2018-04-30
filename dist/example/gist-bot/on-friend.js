"use strict";
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
 * Change `import { ... } from '../../'`
 * to     `import { ... } from 'wechaty'`
 * when you are runing with Docker or NPM instead of Git Source.
 */
const _1 = require("../../");
function onFriend(contact, request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!request) {
                console.log('New friend ' + contact.name() + ' relationship confirmed!');
                return;
            }
            /********************************************
             *
             * 从这里开始修改 vvvvvvvvvvvv
             *
             */
            yield request.accept();
            setTimeout((_) => __awaiter(this, void 0, void 0, function* () {
                yield contact.say('thank you for adding me');
            }), 3000);
            if (request.hello === 'ding') {
                const myRoom = yield _1.Room.find({ topic: 'ding' });
                if (!myRoom)
                    return;
                setTimeout((_) => __awaiter(this, void 0, void 0, function* () {
                    yield myRoom.add(contact);
                    yield myRoom.say('welcome ' + contact.name());
                }), 3000);
            }
            /**
             *
             * 到这里结束修改 ^^^^^^^^^^^^
             *
             */
            /*******************************************/
        }
        catch (e) {
            console.log(e);
        }
    });
}
exports.onFriend = onFriend;
//# sourceMappingURL=on-friend.js.map