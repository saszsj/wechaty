#!/usr/bin/env node
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
const HELPER_CONTACT_NAME = 'Bruce LEE';
/**
 *                           ^^^^^^^^^
 *                           ^^^^^^^^^
 *                           ^^^^^^^^^
 * ::::::::: ___CHANGE ME___ :::::::::
 *
 */
/* tslint:disable:variable-name */
const qrcodeTerminal = require('qrcode-terminal');
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

1. Find a room
2. Add people to room
3. Del people from room
4. Change room topic
5. Monitor room events
6. etc...

If you send a message of magic word 'ding',
you will get a invitation to join my own room!
__________________________________________________

Hope you like it, and you are very welcome to
upgrade me for more super powers!

Please wait... I'm trying to login in...

`;
console.log(welcome);
const bot = _1.Wechaty.instance({ profile: _1.config.DEFAULT_PROFILE });
bot
    .on('scan', (url, code) => {
    if (!/201|200/.test(String(code))) {
        const loginUrl = url.replace(/\/qrcode\//, '/l/');
        qrcodeTerminal.generate(loginUrl);
    }
    console.log(`${url}\n[${code}] Scan QR Code in above url to login: `);
})
    .on('logout', user => _1.log.info('Bot', `${user.name()} logouted`))
    .on('error', e => _1.log.info('Bot', 'error: %s', e))
    .on('login', function (user) {
    return __awaiter(this, void 0, void 0, function* () {
        let msg = `${user.name()} logined`;
        _1.log.info('Bot', msg);
        yield this.say(msg);
        msg = `setting to manageDingRoom() after 3 seconds ... `;
        _1.log.info('Bot', msg);
        yield this.say(msg);
        setTimeout(manageDingRoom.bind(this), 3000);
    });
})
    .on('room-join', function (room, inviteeList, inviter) {
    _1.log.info('Bot', 'EVENT: room-join - Room %s got new member %s, invited by %s', room.topic(), inviteeList.map(c => c.name()).join(','), inviter.name());
})
    .on('room-leave', function (room, leaverList) {
    _1.log.info('Bot', 'EVENT: room-leave - Room %s lost member %s', room.topic(), leaverList.map(c => c.name()).join(','));
})
    .on('room-topic', function (room, topic, oldTopic, changer) {
    try {
        _1.log.info('Bot', 'EVENT: room-topic - Room %s change topic to %s by member %s', oldTopic, topic, changer.name());
    }
    catch (e) {
        _1.log.error('Bot', 'room-topic event exception: %s', e.stack);
    }
})
    .on('message', function (message) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = message.room();
        const sender = message.from();
        const content = message.content();
        console.log((room ? '[' + room.topic() + ']' : '')
            + '<' + sender.name() + '>'
            + ':' + message.toStringDigest());
        if (message.self()) {
            return; // skip self
        }
        /**
         * `ding` will be the magic(toggle) word:
         *  1. say ding first time, will got a room invitation
         *  2. say ding in room, will be removed out
         */
        if (/^ding$/i.test(content)) {
            /**
             *  in-room message
             */
            if (room) {
                if (/^ding/i.test(room.topic())) {
                    /**
                     * move contact out of room
                     */
                    getOutRoom(sender, room);
                }
                /**
                 * peer to peer message
                 */
            }
            else {
                /**
                 * find room name start with "ding"
                 */
                try {
                    const dingRoom = yield _1.Room.find({ topic: /^ding/i });
                    if (dingRoom) {
                        /**
                         * room found
                         */
                        _1.log.info('Bot', 'onMessage: got dingRoom: %s', dingRoom.topic());
                        if (dingRoom.has(sender)) {
                            /**
                             * speaker is already in room
                             */
                            _1.log.info('Bot', 'onMessage: sender has already in dingRoom');
                            sender.say('no need to ding again, because you are already in ding room');
                            // sendMessage({
                            //   content: 'no need to ding again, because you are already in ding room'
                            //   , to: sender
                            // })
                        }
                        else {
                            /**
                             * put speaker into room
                             */
                            _1.log.info('Bot', 'onMessage: add sender(%s) to dingRoom(%s)', sender.name(), dingRoom.topic());
                            sender.say('ok, I will put you in ding room!');
                            putInRoom(sender, dingRoom);
                        }
                    }
                    else {
                        /**
                         * room not found
                         */
                        _1.log.info('Bot', 'onMessage: dingRoom not found, try to create one');
                        /**
                         * create the ding room
                         */
                        yield createDingRoom(sender);
                        /**
                         * listen events from ding room
                         */
                        manageDingRoom();
                    }
                }
                catch (e) {
                    _1.log.error(e);
                }
            }
        }
    });
})
    .init()
    .catch(e => console.error(e));
function manageDingRoom() {
    return __awaiter(this, void 0, void 0, function* () {
        _1.log.info('Bot', 'manageDingRoom()');
        /**
         * Find Room
         */
        try {
            const room = yield _1.Room.find({ topic: /^ding/i });
            if (!room) {
                _1.log.warn('Bot', 'there is no room topic ding(yet)');
                return;
            }
            _1.log.info('Bot', 'start monitor "ding" room join/leave event');
            /**
             * Event: Join
             */
            room.on('join', function (inviteeList, inviter) {
                _1.log.verbose('Bot', 'Room EVENT: join - %s, %s', inviteeList.map(c => c.name()).join(', '), inviter.name());
                checkRoomJoin.call(this, room, inviteeList, inviter);
            });
            /**
             * Event: Leave
             */
            room.on('leave', (leaver) => {
                _1.log.info('Bot', 'Room EVENT: leave - %s leave, byebye', leaver.name());
            });
            /**
             * Event: Topic Change
             */
            room.on('topic', (topic, oldTopic, changer) => {
                _1.log.info('Bot', 'Room EVENT: topic - changed from %s to %s by member %s', oldTopic, topic, changer.name());
            });
        }
        catch (e) {
            _1.log.warn('Bot', 'Room.find rejected: %s', e.stack);
        }
    });
}
function checkRoomJoin(room, inviteeList, inviter) {
    return __awaiter(this, void 0, void 0, function* () {
        _1.log.info('Bot', 'checkRoomJoin(%s, %s, %s)', room.topic(), inviteeList.map(c => c.name()).join(','), inviter.name());
        try {
            // let to, content
            const user = bot.self();
            if (!user) {
                throw new Error('no user');
            }
            if (inviter.id !== user.id) {
                yield room.say('RULE1: Invitation is limited to me, the owner only. Please do not invit people without notify me.', inviter);
                yield room.say('Please contact me: by send "ding" to me, I will re-send you a invitation. Now I will remove you out, sorry.', inviteeList);
                room.topic('ding - warn ' + inviter.name());
                setTimeout(_ => inviteeList.forEach(c => room.del(c)), 10 * 1000);
            }
            else {
                yield room.say('Welcome to my room! :)');
                let welcomeTopic;
                welcomeTopic = inviteeList.map(c => c.name()).join(', ');
                yield room.topic('ding - welcome ' + welcomeTopic);
            }
        }
        catch (e) {
            _1.log.error('Bot', 'checkRoomJoin() exception: %s', e.stack);
        }
    });
}
function putInRoom(contact, room) {
    return __awaiter(this, void 0, void 0, function* () {
        _1.log.info('Bot', 'putInRoom(%s, %s)', contact.name(), room.topic());
        try {
            yield room.add(contact);
            setTimeout(_ => room.say('Welcome ', contact), 10 * 1000);
        }
        catch (e) {
            _1.log.error('Bot', 'putInRoom() exception: ' + e.stack);
        }
    });
}
function getOutRoom(contact, room) {
    return __awaiter(this, void 0, void 0, function* () {
        _1.log.info('Bot', 'getOutRoom(%s, %s)', contact, room);
        try {
            yield room.say('You said "ding" in my room, I will remove you out.');
            yield room.del(contact);
        }
        catch (e) {
            _1.log.error('Bot', 'getOutRoom() exception: ' + e.stack);
        }
    });
}
function getHelperContact() {
    _1.log.info('Bot', 'getHelperContact()');
    // create a new room at least need 3 contacts
    return _1.Contact.find({ name: HELPER_CONTACT_NAME });
}
function createDingRoom(contact) {
    return __awaiter(this, void 0, void 0, function* () {
        _1.log.info('Bot', 'createDingRoom(%s)', contact);
        try {
            const helperContact = yield getHelperContact();
            if (!helperContact) {
                _1.log.warn('Bot', 'getHelperContact() found nobody');
                return;
            }
            _1.log.info('Bot', 'getHelperContact() ok. got: %s', helperContact.name());
            const contactList = [contact, helperContact];
            _1.log.verbose('Bot', 'contactList: %s', contactList.join(','));
            const room = yield _1.Room.create(contactList, 'ding');
            _1.log.info('Bot', 'createDingRoom() new ding room created: %s', room);
            yield room.topic('ding - created');
            yield room.say('ding - created');
            return room;
        }
        catch (e) {
            _1.log.error('Bot', 'getHelperContact() exception:', e.stack);
            throw e;
        }
    });
}
//# sourceMappingURL=room-bot.js.map