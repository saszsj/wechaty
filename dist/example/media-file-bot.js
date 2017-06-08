"use strict";
/**
 *
 * Wechaty - Wechat for Bot
 *
 * Connecting ChatBots
 * https://github.com/wechaty/wechaty
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:variable-name */
const QrcodeTerminal = require('qrcode-terminal');
// import { inspect }            from 'util'
const fs_1 = require("fs");
/**
 * Change `import { ... } from '../'`
 * to     `import { ... } from 'wechaty'`
 * when you are runing with Docker or NPM instead of Git Source.
 */
const _1 = require("../");
const bot = _1.Wechaty.instance({ profile: _1.Config.DEFAULT_PROFILE });
bot
    .on('scan', (url, code) => {
    if (!/201|200/.test(String(code))) {
        const loginUrl = url.replace(/\/qrcode\//, '/l/');
        QrcodeTerminal.generate(loginUrl);
    }
    console.log(`${url}\n[${code}] Scan QR Code in above url to login: `);
})
    .on('login', user => console.log(`${user} logined`))
    .on('message', m => {
    console.log(`RECV: ${m}`);
    // console.log(inspect(m))
    saveRawObj(m.rawObj);
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
    const filename = message.filename();
    console.log('IMAGE local filename: ' + filename);
    const fileStream = fs_1.createWriteStream(filename);
    console.log('start to readyStream()');
    message.readyStream()
        .then(stream => {
        stream.pipe(fileStream)
            .on('close', () => {
            console.log('finish readyStream()');
        });
    })
        .catch(e => console.log('stream error:' + e));
}
function saveRawObj(o) {
    fs_1.writeFileSync('rawObj.log', JSON.stringify(o, null, '  ') + '\n\n\n', { flag: 'a' });
}
//# sourceMappingURL=media-file-bot.js.map