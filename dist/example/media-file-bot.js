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
// import { inspect }            from 'util'
const fs_1 = require("fs");
/* tslint:disable:variable-name */
const qrcodeTerminal = require("qrcode-terminal");
/**
 * Change `import { ... } from '../'`
 * to     `import { ... } from 'wechaty'`
 * when you are runing with Docker or NPM instead of Git Source.
 */
const _1 = require("../");
const bot = _1.Wechaty.instance({ profile: _1.config.DEFAULT_PROFILE });
bot
    .on('scan', (url, code) => {
    if (!/201|200/.test(String(code))) {
        const loginUrl = url.replace(/\/qrcode\//, '/l/');
        qrcodeTerminal.generate(loginUrl);
    }
    console.log(`${url}\n[${code}] Scan QR Code in above url to login: `);
})
    .on('login', user => console.log(`${user} logined`))
    .on('message', m => {
    console.log(`RECV: ${m}`);
    // console.log(inspect(m))
    // saveRawObj(m.rawObj)
    if (m.type() === _1.MsgType.IMAGE
        || m.type() === _1.MsgType.EMOTICON
        || m.type() === _1.MsgType.VIDEO
        || m.type() === _1.MsgType.VOICE
        || m.type() === _1.MsgType.MICROVIDEO
        || m.type() === _1.MsgType.APP
        || (m.type() === _1.MsgType.TEXT && m.typeSub() === _1.MsgType.LOCATION) // LOCATION
    ) {
        saveMediaFile(m);
    }
})
    .init()
    .catch(e => console.error('bot.init() error: ' + e));
function saveMediaFile(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const filename = message.filename();
        console.log('IMAGE local filename: ' + filename);
        const fileStream = fs_1.createWriteStream(filename);
        console.log('start to readyStream()');
        try {
            const netStream = yield message.readyStream();
            netStream
                .pipe(fileStream)
                .on('close', _ => console.log('finish readyStream()'));
        }
        catch (e) {
            console.error('stream error:', e);
        }
    });
}
// function saveRawObj(o) {
//   writeFileSync('rawObj.log', JSON.stringify(o, null, '  ') + '\n\n\n', { flag: 'a' })
// }
//# sourceMappingURL=media-file-bot.js.map