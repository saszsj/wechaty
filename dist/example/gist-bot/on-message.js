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
function onMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const room = message.room();
            const sender = message.from();
            const content = message.content();
            console.log((room ? '[' + room.topic() + ']' : '')
                + '<' + sender.name() + '>'
                + ':' + message.toStringDigest());
            if (message.self() || room) {
                console.log('message is sent from myself, or inside a room.');
                return;
            }
            /********************************************
             *
             * 从下面开始修改vvvvvvvvvvvv
             *
             */
            if (content === 'ding') {
                yield message.say('thanks for ding me');
                const myRoom = yield _1.Room.find({ topic: 'ding' });
                if (!myRoom)
                    return;
                if (myRoom.has(sender)) {
                    yield sender.say('no need to ding again, because you are already in ding room');
                    return;
                }
                yield sender.say('ok, I will put you in ding room!');
                yield myRoom.add(sender);
                return;
            }
            else if (content === 'dong') {
                yield sender.say('ok, dong me is welcome, too.');
                return;
            }
            /**
             *
             * 到这里结束修改^^^^^^^^^^^^
             *
             */
            /*********************************************/
        }
        catch (e) {
            console.error(e);
        }
    });
}
exports.onMessage = onMessage;
//# sourceMappingURL=on-message.js.map