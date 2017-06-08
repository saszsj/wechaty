"use strict";
/**
 *
 * Wechaty - Wechat for Bot
 *
 * Connecting ChatBots
 * https://github.com/wechaty/wechaty
 *
 * demo for modulize code for logic
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Change `import { ... } from '../../'`
 * to     `import { ... } from 'wechaty'`
 * when you are runing with Docker or NPM instead of Git Source.
 */
const _1 = require("../../");
const on_message_1 = require("./on-message");
const on_friend_1 = require("./on-friend");
const on_room_join_1 = require("./on-room-join");
const welcome = `
=============== Powered by Wechaty ===============
-------- https://github.com/wechaty/wechaty --------

Please wait... I'm trying to login in...

`;
console.log(welcome);
_1.Wechaty.instance({ profile: _1.Config.DEFAULT_PROFILE })
    .on('scan', (url, code) => {
    if (!/201|200/.test(String(code))) {
        const loginUrl = url.replace(/\/qrcode\//, '/l/');
        require('qrcode-terminal').generate(loginUrl);
    }
    console.log(`${url}\n[${code}] Scan QR Code in above url to login: `);
})
    .on('login', function (user) {
    _1.log.info('Bot', `${user.name()} logined`);
    this.say(`wechaty logined`);
})
    .on('logout', user => _1.log.info('Bot', `${user.name()} logouted`))
    .on('error', error => _1.log.info('Bot', 'error: %s', error))
    .on('message', on_message_1.onMessage)
    .on('friend', on_friend_1.onFriend)
    .on('room-join', on_room_join_1.onRoomJoin)
    .init()
    .catch(e => console.error(e));
//# sourceMappingURL=index.js.map