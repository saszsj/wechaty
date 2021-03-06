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
const events_1 = require("events");
const config_1 = require("./config");
const contact_1 = require("./contact");
const message_1 = require("./message");
const util_lib_1 = require("./util-lib");
/**
 *
 * wechaty: Wechat for Bot. and for human who talk to bot/robot
 *
 * Licenst: ISC
 * https://github.com/zixia/wechaty
 *
 * Add/Del/Topic: https://github.com/wechaty/wechaty/issues/32
 *
 */
class Room extends events_1.EventEmitter {
    constructor(id) {
        super();
        this.id = id;
        config_1.log.silly('Room', `constructor(${id})`);
    }
    toString() { return this.id; }
    toStringEx() { return `Room(${this.obj && this.obj.topic}[${this.id}])`; }
    isReady() {
        return !!(this.obj && this.obj.memberList && this.obj.memberList.length);
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isReady()) {
                this.dirtyObj = this.obj;
            }
            this.obj = null;
            yield this.ready();
            return;
        });
    }
    readyAllMembers(memberList) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const member of memberList) {
                const contact = contact_1.default.load(member.UserName);
                yield contact.ready();
            }
            return;
        });
    }
    ready(contactGetter) {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.silly('Room', 'ready(%s)', contactGetter ? contactGetter.constructor.name : '');
            if (!this.id) {
                const e = new Error('ready() on a un-inited Room');
                config_1.log.warn('Room', e.message);
                throw e;
            }
            else if (this.isReady()) {
                return this;
            }
            else if (this.obj && this.obj.id) {
                config_1.log.warn('Room', 'ready() has obj.id but memberList empty in room %s. reloading', this.obj.topic);
            }
            if (!contactGetter) {
                contactGetter = config_1.config.puppetInstance()
                    .getContact.bind(config_1.config.puppetInstance());
            }
            if (!contactGetter) {
                throw new Error('no contactGetter');
            }
            try {
                const data = yield contactGetter(this.id);
                config_1.log.silly('Room', `contactGetter(${this.id}) resolved`);
                this.rawObj = data;
                yield this.readyAllMembers(this.rawObj.MemberList || []);
                this.obj = this.parse(this.rawObj);
                if (!this.obj) {
                    throw new Error('no this.obj set after contactGetter');
                }
                yield Promise.all(this.obj.memberList.map(c => c.ready(contactGetter)));
                return this;
            }
            catch (e) {
                config_1.log.error('Room', 'contactGetter(%s) exception: %s', this.id, e.message);
                config_1.Raven.captureException(e);
                throw e;
            }
        });
    }
    on(event, listener) {
        config_1.log.verbose('Room', 'on(%s, %s)', event, typeof listener);
        // const thisWithSay = {
        //   say: (content: string) => {
        //     return Config.puppetInstance()
        //                   .say(content)
        //   }
        // }
        // super.on(event, function() {
        //   return listener.apply(thisWithSay, arguments)
        // })
        super.on(event, listener); // Room is `Sayable`
        return this;
    }
    say(textOrMedia, replyTo) {
        const content = textOrMedia instanceof message_1.MediaMessage ? textOrMedia.filename() : textOrMedia;
        config_1.log.verbose('Room', 'say(%s, %s)', content, Array.isArray(replyTo)
            ? replyTo.map(c => c.name()).join(', ')
            : replyTo ? replyTo.name() : '');
        let m;
        if (typeof textOrMedia === 'string') {
            m = new message_1.Message();
            const replyToList = [].concat(replyTo || []);
            if (replyToList.length > 0) {
                const AT_SEPRATOR = String.fromCharCode(8197);
                const mentionList = replyToList.map(c => '@' + c.name()).join(AT_SEPRATOR);
                m.content(mentionList + ' ' + content);
            }
            else {
                m.content(content);
            }
            // m.to(replyToList[0])
        }
        else
            m = textOrMedia;
        m.room(this);
        return config_1.config.puppetInstance()
            .send(m);
    }
    get(prop) { return (this.obj && this.obj[prop]) || (this.dirtyObj && this.dirtyObj[prop]); }
    parse(rawObj) {
        if (!rawObj) {
            config_1.log.warn('Room', 'parse() on a empty rawObj?');
            return null;
        }
        const memberList = (rawObj.MemberList || [])
            .map(m => contact_1.default.load(m.UserName));
        const nameMap = this.parseMap('name', rawObj.MemberList);
        const roomAliasMap = this.parseMap('roomAlias', rawObj.MemberList);
        const contactAliasMap = this.parseMap('contactAlias', rawObj.MemberList);
        return {
            id: rawObj.UserName,
            encryId: rawObj.EncryChatRoomId,
            topic: rawObj.NickName,
            ownerUin: rawObj.OwnerUin,
            memberList,
            nameMap,
            roomAliasMap,
            contactAliasMap,
        };
    }
    parseMap(parseContent, memberList) {
        const mapList = new Map();
        if (memberList && memberList.map) {
            memberList.forEach(member => {
                let tmpName;
                const contact = contact_1.default.load(member.UserName);
                switch (parseContent) {
                    case 'name':
                        tmpName = contact.name();
                        break;
                    case 'roomAlias':
                        tmpName = member.DisplayName;
                        break;
                    case 'contactAlias':
                        tmpName = contact.alias() || '';
                        break;
                    default:
                        throw new Error('parseMap failed, member not found');
                }
                /**
                 * ISSUE #64 emoji need to be striped
                 * ISSUE #104 never use remark name because sys group message will never use that
                 * @rui: Wrong for 'never use remark name because sys group message will never use that', see more in the latest comment in #104
                 * @rui: webwx's NickName here return contactAlias, if not set contactAlias, return name
                 * @rui: 2017-7-2 webwx's NickName just ruturn name, no contactAlias
                 */
                mapList[member.UserName] = util_lib_1.default.stripEmoji(tmpName);
            });
        }
        return mapList;
    }
    dumpRaw() {
        console.error('======= dump raw Room =======');
        Object.keys(this.rawObj).forEach(k => console.error(`${k}: ${this.rawObj[k]}`));
    }
    dump() {
        console.error('======= dump Room =======');
        Object.keys(this.obj).forEach(k => console.error(`${k}: ${this.obj && this.obj[k]}`));
    }
    add(contact) {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('Room', 'add(%s)', contact);
            if (!contact) {
                throw new Error('contact not found');
            }
            const n = config_1.config.puppetInstance()
                .roomAdd(this, contact);
            return n;
        });
    }
    del(contact) {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('Room', 'del(%s)', contact.name());
            if (!contact) {
                throw new Error('contact not found');
            }
            const n = yield config_1.config.puppetInstance()
                .roomDel(this, contact)
                .then(_ => this.delLocal(contact));
            return n;
        });
    }
    delLocal(contact) {
        config_1.log.verbose('Room', 'delLocal(%s)', contact);
        const memberList = this.obj && this.obj.memberList;
        if (!memberList || memberList.length === 0) {
            return 0; // already in refreshing
        }
        let i;
        for (i = 0; i < memberList.length; i++) {
            if (memberList[i].id === contact.id) {
                break;
            }
        }
        if (i < memberList.length) {
            memberList.splice(i, 1);
            return 1;
        }
        return 0;
    }
    quit() {
        throw new Error('wx web not implement yet');
        // WechatyBro.glue.chatroomFactory.quit("@@1c066dfcab4ef467cd0a8da8bec90880035aa46526c44f504a83172a9086a5f7"
    }
    topic(newTopic) {
        if (!this.isReady()) {
            config_1.log.warn('Room', 'topic() room not ready');
        }
        if (newTopic) {
            config_1.log.verbose('Room', 'topic(%s)', newTopic);
            config_1.config.puppetInstance()
                .roomTopic(this, newTopic)
                .catch(e => {
                config_1.log.warn('Room', 'topic(newTopic=%s) exception: %s', newTopic, e && e.message || e);
                config_1.Raven.captureException(e);
            });
            if (!this.obj) {
                this.obj = {};
            }
            Object.assign(this.obj, { topic: newTopic });
            return;
        }
        return util_lib_1.default.plainText(this.obj ? this.obj.topic : '');
    }
    /**
     * should be deprecated
     * @deprecated
     */
    nick(contact) {
        config_1.log.warn('Room', 'nick(Contact) DEPRECATED, use alias(Contact) instead.');
        return this.alias(contact);
    }
    /**
     * return contact's roomAlias in the room, the same as roomAlias
     * @param {Contact} contact
     * @returns {string | null} If a contact has an alias in room, return string, otherwise return null
     */
    alias(contact) {
        return this.roomAlias(contact);
    }
    roomAlias(contact) {
        if (!this.obj || !this.obj.roomAliasMap) {
            return null;
        }
        return this.obj.roomAliasMap[contact.id] || null;
    }
    has(contact) {
        if (!this.obj || !this.obj.memberList) {
            return false;
        }
        return this.obj.memberList
            .filter(c => c.id === contact.id)
            .length > 0;
    }
    owner() {
        const user = config_1.config.puppetInstance().user;
        if (this.rawObj.IsOwner === 1) {
            return user;
        }
        if (this.rawObj.ChatRoomOwner) {
            return contact_1.default.load(this.rawObj.ChatRoomOwner);
        }
        config_1.log.info('Room', 'owner() is limited by Tencent API, sometimes work sometimes not');
        return null;
    }
    memberAll(queryArg) {
        if (typeof queryArg === 'string') {
            //
            // use the following `return` statement to do this job.
            //
            // const nameList = this.memberAll({name: queryArg})
            // const roomAliasList = this.memberAll({roomAlias: queryArg})
            // const contactAliasList = this.memberAll({contactAlias: queryArg})
            // if (nameList) {
            //   contactList = contactList.concat(nameList)
            // }
            // if (roomAliasList) {
            //   contactList = contactList.concat(roomAliasList)
            // }
            // if (contactAliasList) {
            //   contactList = contactList.concat(contactAliasList)
            // }
            return [].concat(this.memberAll({ name: queryArg }), this.memberAll({ roomAlias: queryArg }), this.memberAll({ contactAlias: queryArg }));
        }
        /**
         * We got filter parameter
         */
        config_1.log.silly('Room', 'memberAll({ %s })', Object.keys(queryArg)
            .map(k => `${k}: ${queryArg[k]}`)
            .join(', '));
        if (Object.keys(queryArg).length !== 1) {
            throw new Error('Room member find queryArg only support one key. multi key support is not availble now.');
        }
        if (!this.obj || !this.obj.memberList) {
            config_1.log.warn('Room', 'member() not ready');
            return [];
        }
        const filterKey = Object.keys(queryArg)[0];
        /**
         * ISSUE #64 emoji need to be striped
         */
        const filterValue = util_lib_1.default.stripEmoji(queryArg[filterKey]);
        const keyMap = {
            contactAlias: 'contactAliasMap',
            name: 'nameMap',
            alias: 'roomAliasMap',
            roomAlias: 'roomAliasMap',
        };
        const filterMapName = keyMap[filterKey];
        if (!filterMapName) {
            throw new Error('unsupport filter key: ' + filterKey);
        }
        if (!filterValue) {
            throw new Error('filterValue not found');
        }
        const filterMap = this.obj[filterMapName];
        const idList = Object.keys(filterMap)
            .filter(id => filterMap[id] === filterValue);
        config_1.log.silly('Room', 'memberAll() check %s from %s: %s', filterValue, filterKey, JSON.stringify(filterMap));
        if (idList.length) {
            return idList.map(id => contact_1.default.load(id));
        }
        else {
            return [];
        }
    }
    member(queryArg) {
        config_1.log.verbose('Room', 'member(%s)', JSON.stringify(queryArg));
        const memberList = this.memberAll(queryArg);
        if (!memberList || !memberList.length) {
            return null;
        }
        if (memberList.length > 1) {
            config_1.log.warn('Room', 'member(%s) get %d contacts, use the first one by default', JSON.stringify(queryArg), memberList.length);
        }
        return memberList[0];
    }
    memberList() {
        config_1.log.verbose('Room', 'memberList');
        if (!this.obj || !this.obj.memberList || this.obj.memberList.length < 1) {
            config_1.log.warn('Room', 'memberList() not ready');
            config_1.log.verbose('Room', 'memberList() trying call refresh() to update');
            this.refresh().then(() => {
                config_1.log.verbose('Room', 'memberList() refresh() done');
            });
            return [];
        }
        return this.obj.memberList;
    }
    static create(contactList, topic) {
        config_1.log.verbose('Room', 'create(%s, %s)', contactList.join(','), topic);
        if (!contactList || !Array.isArray(contactList)) {
            throw new Error('contactList not found');
        }
        return config_1.config.puppetInstance()
            .roomCreate(contactList, topic)
            .catch(e => {
            config_1.log.error('Room', 'create() exception: %s', e && e.stack || e.message || e);
            config_1.Raven.captureException(e);
            throw e;
        });
    }
    static findAll(query) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!query) {
                query = { topic: /.*/ };
            }
            config_1.log.verbose('Room', 'findAll({ topic: %s })', query.topic);
            let topicFilter = query.topic;
            if (!topicFilter) {
                throw new Error('topicFilter not found');
            }
            let filterFunction;
            if (topicFilter instanceof RegExp) {
                filterFunction = `(function (c) { return ${topicFilter.toString()}.test(c) })`;
            }
            else if (typeof topicFilter === 'string') {
                topicFilter = topicFilter.replace(/'/g, '\\\'');
                filterFunction = `(function (c) { return c === '${topicFilter}' })`;
            }
            else {
                throw new Error('unsupport topic type');
            }
            const roomList = yield config_1.config.puppetInstance()
                .roomFind(filterFunction)
                .catch(e => {
                config_1.log.verbose('Room', 'findAll() rejected: %s', e.message);
                config_1.Raven.captureException(e);
                return []; // fail safe
            });
            for (let i = 0; i < roomList.length; i++) {
                yield roomList[i].ready();
            }
            return roomList;
        });
    }
    /**
     * try to find a room by filter: {topic: string | RegExp}
     * @param {RoomQueryFilter} query
     * @returns {Promise<Room | null>} If can find the room, return Room, or return null
     */
    static find(query) {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('Room', 'find({ topic: %s })', query.topic);
            const roomList = yield Room.findAll(query);
            if (!roomList || roomList.length < 1) {
                return null;
            }
            else if (roomList.length > 1) {
                config_1.log.warn('Room', 'find() got more than one result, return the 1st one.');
            }
            return roomList[0];
        });
    }
    /**
     * @todo document me
     */
    static load(id) {
        if (!id) {
            throw new Error('Room.load() no id');
        }
        if (id in Room.pool) {
            return Room.pool[id];
        }
        return Room.pool[id] = new Room(id);
    }
}
Room.pool = new Map();
exports.Room = Room;
exports.default = Room;
//# sourceMappingURL=room.js.map