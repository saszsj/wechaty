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
/**
 * Change `import { ... } from '../'`
 * to     `import { ... } from 'wechaty'`
 * when you are runing with Docker or NPM instead of Git Source.
 */
const _1 = require("../");
const bot = _1.Wechaty.instance();
bot
    .on('scan', (url, code) => {
    if (!/201|200/.test(String(code))) {
        const loginUrl = url.replace(/\/qrcode\//, '/l/');
        QrcodeTerminal.generate(loginUrl);
    }
    console.log(`${url}\n[${code}] Scan QR Code in above url to login: `);
})
    .on('message', m => {
    if (m.self()) {
        return;
    }
    m.say('roger'); // 1. reply others' msg
    console.log(`RECV: ${m}, REPLY: "roger"`); // 2. log message
})
    .init()
    .catch(e => console.error(e));
//# sourceMappingURL=roger-bot.js.map