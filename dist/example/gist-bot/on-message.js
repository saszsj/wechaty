"use strict";
/**
 * Wechaty - Wechat for Bot. Connecting ChatBots
 *
 * Licenst: ISC
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
                message.say('thanks for ding me');
                const myRoom = yield _1.Room.find({ topic: 'ding' });
                if (!myRoom)
                    return;
                if (myRoom.has(sender)) {
                    sender.say('no need to ding again, because you are already in ding room');
                    return;
                }
                sender.say('ok, I will put you in ding room!');
                myRoom.add(sender);
                return;
            }
            else if (content === 'dong') {
                sender.say('ok, dong me is welcome, too.');
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
            console.log(e);
        }
    });
}
exports.onMessage = onMessage;
//# sourceMappingURL=on-message.js.map