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
const fs = require("fs");
const path = require("path");
const config_1 = require("./config");
const contact_1 = require("./contact");
const room_1 = require("./room");
const util_lib_1 = require("./util-lib");
var AppMsgType;
(function (AppMsgType) {
    AppMsgType[AppMsgType["TEXT"] = 1] = "TEXT";
    AppMsgType[AppMsgType["IMG"] = 2] = "IMG";
    AppMsgType[AppMsgType["AUDIO"] = 3] = "AUDIO";
    AppMsgType[AppMsgType["VIDEO"] = 4] = "VIDEO";
    AppMsgType[AppMsgType["URL"] = 5] = "URL";
    AppMsgType[AppMsgType["ATTACH"] = 6] = "ATTACH";
    AppMsgType[AppMsgType["OPEN"] = 7] = "OPEN";
    AppMsgType[AppMsgType["EMOJI"] = 8] = "EMOJI";
    AppMsgType[AppMsgType["VOICE_REMIND"] = 9] = "VOICE_REMIND";
    AppMsgType[AppMsgType["SCAN_GOOD"] = 10] = "SCAN_GOOD";
    AppMsgType[AppMsgType["GOOD"] = 13] = "GOOD";
    AppMsgType[AppMsgType["EMOTION"] = 15] = "EMOTION";
    AppMsgType[AppMsgType["CARD_TICKET"] = 16] = "CARD_TICKET";
    AppMsgType[AppMsgType["REALTIME_SHARE_LOCATION"] = 17] = "REALTIME_SHARE_LOCATION";
    AppMsgType[AppMsgType["TRANSFERS"] = 2000] = "TRANSFERS";
    AppMsgType[AppMsgType["RED_ENVELOPES"] = 2001] = "RED_ENVELOPES";
    AppMsgType[AppMsgType["READER_TYPE"] = 100001] = "READER_TYPE";
})(AppMsgType = exports.AppMsgType || (exports.AppMsgType = {}));
var MsgType;
(function (MsgType) {
    MsgType[MsgType["TEXT"] = 1] = "TEXT";
    MsgType[MsgType["IMAGE"] = 3] = "IMAGE";
    MsgType[MsgType["VOICE"] = 34] = "VOICE";
    MsgType[MsgType["VERIFYMSG"] = 37] = "VERIFYMSG";
    MsgType[MsgType["POSSIBLEFRIEND_MSG"] = 40] = "POSSIBLEFRIEND_MSG";
    MsgType[MsgType["SHARECARD"] = 42] = "SHARECARD";
    MsgType[MsgType["VIDEO"] = 43] = "VIDEO";
    MsgType[MsgType["EMOTICON"] = 47] = "EMOTICON";
    MsgType[MsgType["LOCATION"] = 48] = "LOCATION";
    MsgType[MsgType["APP"] = 49] = "APP";
    MsgType[MsgType["VOIPMSG"] = 50] = "VOIPMSG";
    MsgType[MsgType["STATUSNOTIFY"] = 51] = "STATUSNOTIFY";
    MsgType[MsgType["VOIPNOTIFY"] = 52] = "VOIPNOTIFY";
    MsgType[MsgType["VOIPINVITE"] = 53] = "VOIPINVITE";
    MsgType[MsgType["MICROVIDEO"] = 62] = "MICROVIDEO";
    MsgType[MsgType["SYSNOTICE"] = 9999] = "SYSNOTICE";
    MsgType[MsgType["SYS"] = 10000] = "SYS";
    MsgType[MsgType["RECALLED"] = 10002] = "RECALLED";
})(MsgType = exports.MsgType || (exports.MsgType = {}));
class Message {
    constructor(rawObj) {
        this.rawObj = rawObj;
        this.obj = {};
        this._counter = Message.counter++;
        config_1.log.silly('Message', 'constructor() SN:%d', this._counter);
        if (typeof rawObj === 'string') {
            this.rawObj = JSON.parse(rawObj);
        }
        this.rawObj = rawObj = rawObj || {};
        this.obj = this.parse(rawObj);
        this.id = this.obj.id;
    }
    readyStream() {
        throw Error('abstract method');
    }
    filename() {
        throw Error('not a media message');
    }
    // Transform rawObj to local obj
    parse(rawObj) {
        const obj = {
            id: rawObj.MsgId,
            type: rawObj.MsgType,
            from: rawObj.MMActualSender,
            to: rawObj.ToUserName,
            content: rawObj.MMActualContent,
            status: rawObj.Status,
            digest: rawObj.MMDigest,
            date: rawObj.MMDisplayTime,
            url: rawObj.Url || rawObj.MMAppMsgDownloadUrl || rawObj.MMLocationUrl,
        };
        // FIXME: has there any better method to know the room ID?
        if (rawObj.MMIsChatRoom) {
            if (/^@@/.test(rawObj.FromUserName)) {
                obj.room = rawObj.FromUserName; // MMPeerUserName always eq FromUserName ?
            }
            else if (/^@@/.test(rawObj.ToUserName)) {
                obj.room = rawObj.ToUserName;
            }
            else {
                config_1.log.error('Message', 'parse found a room message, but neither FromUserName nor ToUserName is a room(/^@@/)');
                // obj.room = undefined // bug compatible
            }
            if (obj.to && /^@@/.test(obj.to)) {
                obj.to = undefined;
            }
        }
        return obj;
    }
    toString() {
        return util_lib_1.default.plainText(this.obj.content);
    }
    toStringDigest() {
        const text = util_lib_1.default.digestEmoji(this.obj.digest);
        return '{' + this.typeEx() + '}' + text;
    }
    toStringEx() {
        let s = `${this.constructor.name}#${this._counter}`;
        s += '(' + this.getSenderString();
        s += ':' + this.getContentString() + ')';
        return s;
    }
    getSenderString() {
        const fromName = contact_1.default.load(this.obj.from).name();
        const roomTopic = this.obj.room
            ? (':' + room_1.default.load(this.obj.room).topic())
            : '';
        return `<${fromName}${roomTopic}>`;
    }
    getContentString() {
        let content = util_lib_1.default.plainText(this.obj.content);
        if (content.length > 20) {
            content = content.substring(0, 17) + '...';
        }
        return '{' + this.type() + '}' + content;
    }
    from(contact) {
        if (contact) {
            if (contact instanceof contact_1.default) {
                this.obj.from = contact.id;
            }
            else if (typeof contact === 'string') {
                this.obj.from = contact;
            }
            else {
                throw new Error('unsupport from param: ' + typeof contact);
            }
            return;
        }
        const loadedContact = contact_1.default.load(this.obj.from);
        if (!loadedContact) {
            throw new Error('no from');
        }
        return loadedContact;
    }
    to(contact) {
        if (contact) {
            if (contact instanceof contact_1.default) {
                this.obj.to = contact.id;
            }
            else if (typeof contact === 'string') {
                this.obj.to = contact;
            }
            else {
                throw new Error('unsupport to param ' + typeof contact);
            }
            return;
        }
        // no parameter
        if (!this.obj.to) {
            return null;
        }
        return contact_1.default.load(this.obj.to);
    }
    room(room) {
        if (room) {
            if (room instanceof room_1.default) {
                this.obj.room = room.id;
            }
            else if (typeof room === 'string') {
                this.obj.room = room;
            }
            else {
                throw new Error('unsupport room param ' + typeof room);
            }
            return;
        }
        if (this.obj.room) {
            return room_1.default.load(this.obj.room);
        }
        return null;
    }
    content(content) {
        if (content) {
            this.obj.content = content;
            return;
        }
        return this.obj.content;
    }
    type() {
        return this.obj.type;
    }
    typeSub() {
        if (!this.rawObj) {
            throw new Error('no rawObj');
        }
        return this.rawObj.SubMsgType;
    }
    typeApp() {
        if (!this.rawObj) {
            throw new Error('no rawObj');
        }
        return this.rawObj.AppMsgType;
    }
    typeEx() { return MsgType[this.obj.type]; }
    count() { return this._counter; }
    self() {
        const userId = config_1.config.puppetInstance()
            .userId;
        const fromId = this.obj.from;
        if (!userId || !fromId) {
            throw new Error('no user or no from');
        }
        return fromId === userId;
    }
    /**
     *
     * Get message mentioned contactList.
     * message event table as follows
     *
     * |                                                                            | Web  |  Mac PC Client | iOS Mobile |  android Mobile |
     * | :---                                                                       | :--: |     :----:     |   :---:    |     :---:       |
     * | [You were mentioned] tip ([有人@我]的提示)                                   |  ✘   |        √       |     √      |       √         |
     * | Identify magic code (8197) by copy & paste in mobile                       |  ✘   |        √       |     √      |       ✘         |
     * | Identify magic code (8197) by programming                                  |  ✘   |        ✘       |     ✘      |       ✘         |
     * | Identify two contacts with the same roomAlias by [You were  mentioned] tip |  ✘   |        ✘       |     √      |       √         |
     *
     * @returns {Contact[]} return message mentioned contactList
     *
     * @example
     * ```ts
     * const contactList = message.mentioned()
     * console.log(contactList)
     * ```
     */
    mentioned() {
        let contactList = [];
        const room = this.room();
        if (this.type() !== MsgType.TEXT || !room) {
            return contactList;
        }
        // define magic code `8197` to identify @xxx
        const AT_SEPRATOR = String.fromCharCode(8197);
        const atList = this.content().split(AT_SEPRATOR);
        if (atList.length === 0)
            return contactList;
        // Using `filter(e => e.indexOf('@') > -1)` to filter the string without `@`
        const rawMentionedList = atList
            .filter(str => str.includes('@'))
            .map(str => multipleAt(str))
            .filter(str => !!str); // filter blank string
        // convert 'hello@a@b@c' to [ 'c', 'b@c', 'a@b@c' ]
        function multipleAt(str) {
            str = str.replace(/^.*?@/, '@');
            let name = '';
            const nameList = [];
            str.split('@')
                .filter(mentionName => !!mentionName)
                .reverse()
                .forEach(mentionName => {
                name = mentionName + '@' + name;
                nameList.push(name.slice(0, -1)); // get rid of the `@` at beginning
            });
            return nameList;
        }
        // flatten array, see http://stackoverflow.com/a/10865042/1123955
        const mentionList = [].concat.apply([], rawMentionedList);
        config_1.log.verbose('Message', 'mentioned(%s),get mentionList: %s', this.content(), JSON.stringify(mentionList));
        contactList = [].concat.apply([], mentionList.map(nameStr => room.memberAll(nameStr))
            .filter(contact => !!contact));
        if (contactList.length === 0) {
            config_1.log.warn(`Message`, `message.mentioned() can not found member using room.member() from mentionList, metion string: ${JSON.stringify(mentionList)}`);
        }
        return contactList;
    }
    ready() {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.silly('Message', 'ready()');
            try {
                const from = contact_1.default.load(this.obj.from);
                yield from.ready(); // Contact from
                if (this.obj.to) {
                    const to = contact_1.default.load(this.obj.to);
                    yield to.ready();
                }
                if (this.obj.room) {
                    const room = room_1.default.load(this.obj.room);
                    yield room.ready(); // Room member list
                }
            }
            catch (e) {
                config_1.log.error('Message', 'ready() exception: %s', e.stack);
                config_1.Raven.captureException(e);
                // console.log(e)
                // this.dump()
                // this.dumpRaw()
                throw e;
            }
        });
    }
    /**
     * @deprecated
     */
    get(prop) {
        config_1.log.warn('Message', 'DEPRECATED get() at %s', new Error('stack').stack);
        if (!prop || !(prop in this.obj)) {
            const s = '[' + Object.keys(this.obj).join(',') + ']';
            throw new Error(`Message.get(${prop}) must be in: ${s}`);
        }
        return this.obj[prop];
    }
    /**
     * @deprecated
     */
    set(prop, value) {
        config_1.log.warn('Message', 'DEPRECATED set() at %s', new Error('stack').stack);
        if (typeof value !== 'string') {
            throw new Error('value must be string, we got: ' + typeof value);
        }
        this.obj[prop] = value;
        return this;
    }
    dump() {
        console.error('======= dump message =======');
        Object.keys(this.obj).forEach(k => console.error(`${k}: ${this.obj[k]}`));
    }
    dumpRaw() {
        console.error('======= dump raw message =======');
        Object.keys(this.rawObj).forEach(k => console.error(`${k}: ${this.rawObj && this.rawObj[k]}`));
    }
    static find(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(new Message({ MsgId: '-1' }));
        });
    }
    static findAll(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve([
                new Message({ MsgId: '-2' }),
                new Message({ MsgId: '-3' }),
            ]);
        });
    }
    say(textOrMedia, replyTo) {
        /* tslint:disable:no-use-before-declare */
        const content = textOrMedia instanceof MediaMessage ? textOrMedia.filename() : textOrMedia;
        config_1.log.verbose('Message', 'say(%s, %s)', content, replyTo);
        let m;
        if (typeof textOrMedia === 'string') {
            m = new Message();
            const room = this.room();
            if (room) {
                m.room(room);
            }
            if (!replyTo) {
                m.to(this.from());
                m.content(textOrMedia);
            }
            else if (this.room()) {
                let mentionList;
                if (Array.isArray(replyTo)) {
                    m.to(replyTo[0]);
                    mentionList = replyTo.map(c => '@' + c.name()).join(' ');
                }
                else {
                    m.to(replyTo);
                    mentionList = '@' + replyTo.name();
                }
                m.content(mentionList + ' ' + textOrMedia);
            }
            /* tslint:disable:no-use-before-declare */
        }
        else if (textOrMedia instanceof MediaMessage) {
            m = textOrMedia;
            const room = this.room();
            if (room) {
                m.room(room);
            }
            if (!replyTo) {
                m.to(this.from());
            }
        }
        return config_1.config.puppetInstance()
            .send(m);
    }
}
Message.counter = 0;
exports.Message = Message;
// Message.initType()
class MediaMessage extends Message {
    constructor(rawObjOrFilePath) {
        if (typeof rawObjOrFilePath === 'string') {
            super();
            this.filePath = rawObjOrFilePath;
            const pathInfo = path.parse(rawObjOrFilePath);
            this.fileName = pathInfo.name;
            this.fileExt = pathInfo.ext.replace(/^\./, '');
        }
        else if (rawObjOrFilePath instanceof Object) {
            super(rawObjOrFilePath);
        }
        else {
            throw new Error('not supported construct param');
        }
        // FIXME: decoupling needed
        this.bridge = config_1.config.puppetInstance()
            .bridge;
    }
    ready() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.silly('MediaMessage', 'ready()');
            try {
                yield _super("ready").call(this);
                let url = null;
                switch (this.type()) {
                    case MsgType.EMOTICON:
                        url = yield this.bridge.getMsgEmoticon(this.id);
                        break;
                    case MsgType.IMAGE:
                        url = yield this.bridge.getMsgImg(this.id);
                        break;
                    case MsgType.VIDEO:
                    case MsgType.MICROVIDEO:
                        url = yield this.bridge.getMsgVideo(this.id);
                        break;
                    case MsgType.VOICE:
                        url = yield this.bridge.getMsgVoice(this.id);
                        break;
                    case MsgType.APP:
                        if (!this.rawObj) {
                            throw new Error('no rawObj');
                        }
                        switch (this.typeApp()) {
                            case AppMsgType.ATTACH:
                                if (!this.rawObj.MMAppMsgDownloadUrl) {
                                    throw new Error('no MMAppMsgDownloadUrl');
                                }
                                // had set in Message
                                // url = this.rawObj.MMAppMsgDownloadUrl
                                break;
                            case AppMsgType.URL:
                            case AppMsgType.READER_TYPE:
                                if (!this.rawObj.Url) {
                                    throw new Error('no Url');
                                }
                                // had set in Message
                                // url = this.rawObj.Url
                                break;
                            default:
                                const e = new Error('ready() unsupported typeApp(): ' + this.typeApp());
                                config_1.log.warn('MediaMessage', e.message);
                                this.dumpRaw();
                                throw e;
                        }
                        break;
                    case MsgType.TEXT:
                        if (this.typeSub() === MsgType.LOCATION) {
                            url = yield this.bridge.getMsgPublicLinkImg(this.id);
                        }
                        break;
                    default:
                        throw new Error('not support message type for MediaMessage');
                }
                if (!url) {
                    if (!this.obj.url) {
                        throw new Error('no obj.url');
                    }
                    url = this.obj.url;
                }
                this.obj.url = url;
            }
            catch (e) {
                config_1.log.warn('MediaMessage', 'ready() exception: %s', e.message);
                config_1.Raven.captureException(e);
                throw e;
            }
        });
    }
    ext() {
        if (this.fileExt)
            return this.fileExt;
        switch (this.type()) {
            case MsgType.EMOTICON:
                return 'gif';
            case MsgType.IMAGE:
                return 'jpg';
            case MsgType.VIDEO:
            case MsgType.MICROVIDEO:
                return 'mp4';
            case MsgType.VOICE:
                return 'mp3';
            case MsgType.APP:
                switch (this.typeApp()) {
                    case AppMsgType.URL:
                        return 'url'; // XXX
                }
                break;
            case MsgType.TEXT:
                if (this.typeSub() === MsgType.LOCATION) {
                    return 'jpg';
                }
                break;
        }
        throw new Error('not support type: ' + this.type());
    }
    filename() {
        if (this.fileName && this.fileExt) {
            return this.fileName + '.' + this.fileExt;
        }
        if (!this.rawObj) {
            throw new Error('no rawObj');
        }
        let filename = this.rawObj.FileName || this.rawObj.MediaId || this.rawObj.MsgId;
        const re = /\.[a-z0-9]{1,7}$/i;
        if (!re.test(filename)) {
            const ext = this.rawObj.MMAppMsgFileExt || this.ext();
            filename += '.' + ext;
        }
        return filename;
    }
    // private getMsgImg(id: string): Promise<string> {
    //   return this.bridge.getMsgImg(id)
    //   .catch(e => {
    //     log.warn('MediaMessage', 'getMsgImg(%d) exception: %s', id, e.message)
    //     throw e
    //   })
    // }
    readyStream() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.filePath)
                return fs.createReadStream(this.filePath);
            try {
                yield this.ready();
                // FIXME: decoupling needed
                const cookies = yield config_1.config.puppetInstance().browser.readCookie();
                if (!this.obj.url) {
                    throw new Error('no url');
                }
                return util_lib_1.default.urlStream(this.obj.url, cookies);
            }
            catch (e) {
                config_1.log.warn('MediaMessage', 'stream() exception: %s', e.stack);
                config_1.Raven.captureException(e);
                throw e;
            }
        });
    }
}
exports.MediaMessage = MediaMessage;
/*
 * join room in mac client: https://support.weixin.qq.com/cgi-bin/
 * mmsupport-bin/addchatroombyinvite
 * ?ticket=AUbv%2B4GQA1Oo65ozlIqRNw%3D%3D&exportkey=AS9GWEg4L82fl3Y8e2OeDbA%3D
 * &lang=en&pass_ticket=T6dAZXE27Y6R29%2FFppQPqaBlNwZzw9DAN5RJzzzqeBA%3D
 * &wechat_real_lang=en
 */
exports.default = Message;
//# sourceMappingURL=message.js.map