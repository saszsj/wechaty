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
 *
 * Wechaty bot use a Tuling123.com brain
 *
 * Apply your own tuling123.com API_KEY
 * at: http://www.tuling123.com/html/doc/api.html
 *
 * Enjoy!
 *
 * Wechaty - https://github.com/zixia/wechaty
 *
 */
/* tslint:disable:no-var-requires */
/* tslint:disable:variable-name */
const QrcodeTerminal = require('qrcode-terminal');
const Tuling123 = require('tuling123-client');
/**
 * Change `import { ... } from '../'`
 * to     `import { ... } from 'wechaty'`
 * when you are runing with Docker or NPM instead of Git Source.
 */
const _1 = require("../");
// log.level = 'verbose'
// log.level = 'silly'
/**
 *
 * Apply Your Own Tuling123 Developer API_KEY at:
 * http://www.tuling123.com
 *
 */
const TULING123_API_KEY = '18f25157e0446df58ade098479f74b21';
const tuling = new Tuling123(TULING123_API_KEY);
const bot = _1.Wechaty.instance({ profile: _1.Config.DEFAULT_PROFILE });
console.log(`
Welcome to Tuling Wechaty Bot.
Tuling API: http://www.tuling123.com/html/doc/api.html

Notice: This bot will only active in the room which name contains 'wechaty'.
/* if (/Wechaty/i.test(room.get('name'))) { */

Loading...
`);
bot
    .on('login', user => _1.log.info('Bot', `bot login: ${user}`))
    .on('logout', e => _1.log.info('Bot', 'bot logout.'))
    .on('scan', (url, code) => {
    if (!/201|200/.test(String(code))) {
        const loginUrl = url.replace(/\/qrcode\//, '/l/');
        QrcodeTerminal.generate(loginUrl);
    }
    console.log(`${url}\n[${code}] Scan QR Code in above url to login: `);
})
    .on('message', (msg) => __awaiter(this, void 0, void 0, function* () {
    // Skip message from self, or inside a room
    if (msg.self() || msg.room())
        return;
    _1.log.info('Bot', 'talk: %s', msg);
    tuling.ask(msg.content(), { userid: msg.from() })
        .then(({ text }) => {
        _1.log.info('Tuling123', 'Talker reply:"%s" for "%s" ', text, msg.content());
        msg.say(text);
    })
        .catch(err => {
        _1.log.error('Bot', 'on message rejected: %s', err);
    });
}));
bot.init()
    .catch(e => {
    _1.log.error('Bot', 'init() fail:' + e);
    bot.quit();
    process.exit(-1);
});
//# sourceMappingURL=tuling123-bot.js.map