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
            setTimeout(_ => {
                contact.say('thank you for adding me');
            }, 3000);
            if (request.hello === 'ding') {
                const myRoom = yield _1.Room.find({ topic: 'ding' });
                if (!myRoom)
                    return;
                setTimeout(_ => {
                    myRoom.add(contact);
                    myRoom.say('welcome ' + contact.name());
                }, 3000);
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