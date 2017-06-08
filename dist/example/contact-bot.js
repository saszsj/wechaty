"use strict";
/**
 *
 * Wechaty - Wechat for Bot
 *
 * Connecting ChatBots
 * https://github.com/wechaty/wechaty
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
const fs_1 = require("fs");
/* tslint:disable:variable-name */
const QrcodeTerminal = require('qrcode-terminal');
/**
 * Change `import { ... } from '../'`
 * to     `import { ... } from 'wechaty'`
 * when you are runing with Docker or NPM instead of Git Source.
 */
const _1 = require("../");
const welcome = `
=============== Powered by Wechaty ===============
-------- https://github.com/wechaty/wechaty --------

Hello,

I'm a Wechaty Botie with the following super powers:

1. List all your contacts with weixn id & name

__________________________________________________

Hope you like it, and you are very welcome to
upgrade me for more super powers!

Please wait... I'm trying to login in...

`;
console.log(welcome);
const bot = _1.Wechaty.instance({ profile: _1.Config.DEFAULT_PROFILE });
bot
    .on('login', function (user) {
    _1.log.info('Bot', `${user.name()} logined`);
    this.say('wechaty contact-bot just logined');
    /**
     * Main Contact Bot start from here
     */
    main();
})
    .on('logout', user => _1.log.info('Bot', `${user.name()} logouted`))
    .on('error', e => _1.log.info('Bot', 'error: %s', e))
    .on('scan', (url, code) => {
    if (!/201|200/.test(String(code))) {
        const loginUrl = url.replace(/\/qrcode\//, '/l/');
        QrcodeTerminal.generate(loginUrl);
    }
    console.log(`${url}\n[${code}] Scan QR Code in above url to login: `);
});
bot.init()
    .catch(e => {
    _1.log.error('Bot', 'init() fail: %s', e);
    bot.quit();
    process.exit(-1);
});
/**
 * Main Contact Bot
 */
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const contactList = yield _1.Contact.findAll();
        _1.log.info('Bot', '#######################');
        _1.log.info('Bot', 'Contact number: %d\n', contactList.length);
        /**
         * official contacts list
         */
        for (let i = 0; i < contactList.length; i++) {
            const contact = contactList[i];
            if (contact.official()) {
                _1.log.info('Bot', `official ${i}: ${contact}`);
            }
        }
        /**
         *  Special contact list
         */
        for (let i = 0; i < contactList.length; i++) {
            const contact = contactList[i];
            if (contact.special()) {
                _1.log.info('Bot', `special ${i}: ${contact.name()}`);
            }
        }
        /**
         *  personal contact list
         */
        for (let i = 0; i < contactList.length; i++) {
            const contact = contactList[i];
            if (contact.personal()) {
                _1.log.info('Bot', `personal ${i}: ${contact.get('name')} : ${contact.id}`);
            }
        }
        const MAX = 17;
        for (let i = 0; i < contactList.length; i++) {
            const contact = contactList[i];
            if (!contact.weixin()) {
                yield contact.refresh();
            }
            /**
             * Save avatar to file like: "1-name.jpg"
             */
            const avatarFileName = `${i}-${contact.name()}.jpg`;
            const avatarReadStream = yield contact.avatar();
            const avatarWriteStream = fs_1.createWriteStream(avatarFileName);
            avatarReadStream.pipe(avatarWriteStream);
            _1.log.info('Bot', 'Contact: %s: %s with avatar file: %s', contact.weixin(), contact.name(), avatarFileName);
            if (i > MAX) {
                _1.log.info('Bot', 'Contacts too many, I only show you the first %d ... ', MAX);
                break;
            }
        }
        const SLEEP = 7;
        _1.log.info('Bot', 'I will re-dump contact weixin id & names after %d second... ', SLEEP);
        setTimeout(main, SLEEP * 1000);
    });
}
//# sourceMappingURL=contact-bot.js.map