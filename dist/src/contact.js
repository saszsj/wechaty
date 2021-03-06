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
const config_1 = require("./config");
const message_1 = require("./message");
const util_lib_1 = require("./util-lib");
const wechaty_1 = require("./wechaty");
/**
 * Enum for Gender values.
 * @enum {number}
 */
var Gender;
(function (Gender) {
    Gender[Gender["Unknown"] = 0] = "Unknown";
    Gender[Gender["Male"] = 1] = "Male";
    Gender[Gender["Female"] = 2] = "Female";
})(Gender = exports.Gender || (exports.Gender = {}));
/**
 * @see https://github.com/Chatie/webwx-app-tracker/blob/7c59d35c6ea0cff38426a4c5c912a086c4c512b2/formatted/webwxApp.js#L3848
 */
const specialContactList = [
    'weibo', 'qqmail', 'fmessage', 'tmessage', 'qmessage', 'qqsync', 'floatbottle',
    'lbsapp', 'shakeapp', 'medianote', 'qqfriend', 'readerapp', 'blogapp', 'facebookapp',
    'masssendapp', 'meishiapp', 'feedsapp', 'voip', 'blogappweixin', 'weixin', 'brandsessionholder',
    'weixinreminder', 'wxid_novlwrv3lqwv11', 'gh_22b87fa7cb3c', 'officialaccounts', 'notification_messages',
];
/**
 * Class Contact
 *
 * `Contact` is `Sayable`
 */
class Contact {
    constructor(id) {
        this.id = id;
        config_1.log.silly('Contact', `constructor(${id})`);
        if (typeof id !== 'string') {
            throw new Error('id must be string. found: ' + typeof id);
        }
    }
    toString() {
        if (!this.obj) {
            return this.id;
        }
        return this.obj.alias || this.obj.name || this.id;
    }
    toStringEx() { return `Contact(${this.obj && this.obj.name}[${this.id}])`; }
    parse(rawObj) {
        if (!rawObj || !rawObj.UserName) {
            config_1.log.warn('Contact', 'parse() got empty rawObj!');
        }
        return !rawObj ? null : {
            id: rawObj.UserName,
            uin: rawObj.Uin,
            weixin: rawObj.Alias,
            name: rawObj.NickName,
            alias: rawObj.RemarkName,
            sex: rawObj.Sex,
            province: rawObj.Province,
            city: rawObj.City,
            signature: rawObj.Signature,
            address: rawObj.Alias,
            star: !!rawObj.StarFriend,
            stranger: !!rawObj.stranger,
            avatar: rawObj.HeadImgUrl,
            /**
             * @see 1. https://github.com/Chatie/webwx-app-tracker/blob/7c59d35c6ea0cff38426a4c5c912a086c4c512b2/formatted/webwxApp.js#L3243
             * @see 2. https://github.com/Urinx/WeixinBot/blob/master/README.md
             */
            // tslint:disable-next-line
            official: !!rawObj.UserName && !rawObj.UserName.startsWith('@@') && !!(rawObj.VerifyFlag & 8),
            /**
             * @see 1. https://github.com/Chatie/webwx-app-tracker/blob/7c59d35c6ea0cff38426a4c5c912a086c4c512b2/formatted/webwxApp.js#L3246
             */
            special: specialContactList.indexOf(rawObj.UserName) > -1 || /@qqim$/.test(rawObj.UserName),
        };
    }
    /**
     * Get the weixin number from a contact
     * Sometimes cannot get weixin number due to weixin security mechanism, not recommend.
     * @returns {string | null}
     *
     * @example
     * ```ts
     * const weixin = contact.weixin()
     * ```
     */
    weixin() {
        const wxId = this.obj && this.obj.weixin || null;
        if (!wxId) {
            config_1.log.info('Contact', `weixin() is not able to always work, it's limited by Tencent API`);
            config_1.log.info('Contact', 'weixin() If you want to track a contact between sessions, see FAQ at');
            config_1.log.info('Contact', 'https://github.com/Chatie/wechaty/wiki/FAQ#1-how-to-get-the-permanent-id-for-a-contact');
        }
        return wxId;
    }
    /**
     * Get the name from a contact
     *
     * @returns {string}
     *
     * @example
     * ```ts
     * const name = contact.name()
     * ```
     */
    name() { return util_lib_1.UtilLib.plainText(this.obj && this.obj.name || ''); }
    /**
     * Check if contact is stranger
     *
     * @returns {boolean | null} True for not friend of the bot, False for friend of the bot, null for cannot get the info.
     *
     * @example
     * ```ts
     * const isStranger = contact.stranger()
     * ```
     */
    stranger() {
        if (!this.obj)
            return null;
        return this.obj.stranger;
    }
    /**
     * Check if it's a offical account
     *
     * @returns {boolean|null} True for official account, Flase for contact is not a official account
     *
     * @example
     * ```ts
     * const isOfficial = contact.official()
     * ```
     */
    official() {
        return !!this.obj && this.obj.official;
    }
    /**
     * Check if it's a special contact
     *
     * the contact who's id in following list will be identify as a special contact
     *
     * ```ts
     * 'weibo', 'qqmail', 'fmessage', 'tmessage', 'qmessage', 'qqsync', 'floatbottle',
     * 'lbsapp', 'shakeapp', 'medianote', 'qqfriend', 'readerapp', 'blogapp', 'facebookapp',
     * 'masssendapp', 'meishiapp', 'feedsapp', 'voip', 'blogappweixin', 'weixin', 'brandsessionholder',
     * 'weixinreminder', 'wxid_novlwrv3lqwv11', 'gh_22b87fa7cb3c', 'officialaccounts', 'notification_messages',
     * ```
     * @see https://github.com/Chatie/webwx-app-tracker/blob/7c59d35c6ea0cff38426a4c5c912a086c4c512b2/formatted/webwxApp.js#L3848
     *
     * @returns {boolean|null} True for brand, Flase for contact is not a brand
     *
     * @example
     * ```ts
     * const isSpecial = contact.special()
     * ```
     */
    special() {
        return !!this.obj && this.obj.special;
    }
    /**
     * Check if it's a personal account
     *
     * @returns {boolean|null} True for personal account, Flase for contact is not a personal account
     *
     * @example
     * ```ts
     * const isPersonal = contact.personal()
     * ```
     */
    personal() {
        return !this.official();
    }
    /**
     * Check if the contact is star contact.
     *
     * @returns {boolean} True for star friend, False for no star friend, null for cannot get the info.
     *
     * @example
     * ```ts
     * const isStar = contact.star()
     * ```
     */
    star() {
        if (!this.obj)
            return null;
        return this.obj.star;
    }
    /**
     * Contact gender
     *
     * @returns Gender.Male(2) | Gender.Female(1) | Gender.Unknown(0)
     *
     * @example
     * ```ts
     * const gender = contact.gender()
     * ```
     */
    gender() { return this.obj ? this.obj.sex : Gender.Unknown; }
    /**
     * Get the region 'province' from a contact
     *
     * @returns {string | undefined}
     *
     * @example
     * ```ts
     * const province = contact.province()
     * ```
     */
    province() { return this.obj && this.obj.province; }
    /**
     * Get the region 'city' from a contact
     *
     * @returns {string | undefined}
     *
     * @example
     * ```ts
     * const city = contact.city()
     * ```
     */
    city() { return this.obj && this.obj.city; }
    /**
     * Get avatar picture file stream
     *
     * @returns {Promise<NodeJS.ReadableStream>}
     *
     * @example
     * ```ts
     * const avatarFileName = contact.name() + `.jpg`
     * const avatarReadStream = await contact.avatar()
     * const avatarWriteStream = createWriteStream(avatarFileName)
     * avatarReadStream.pipe(avatarWriteStream)
     * log.info('Bot', 'Contact: %s: %s with avatar file: %s', contact.weixin(), contact.name(), avatarFileName)
     * ```
     */
    avatar() {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('Contact', 'avatar()');
            if (!this.obj || !this.obj.avatar) {
                throw new Error('Can not get avatar: not ready');
            }
            try {
                // const hostname = await (config.puppetInstance() as PuppetWeb).browser.hostname()
                const currentUrl = yield config_1.config.puppetInstance().browser.driver.driver.getCurrentUrl();
                const avatarUrl = `${currentUrl}${this.obj.avatar.substring(1)}`;
                const cookies = yield config_1.config.puppetInstance().browser.readCookie();
                config_1.log.silly('Contact', 'avatar() url: %s', avatarUrl);
                return util_lib_1.UtilLib.urlStream(avatarUrl, cookies);
            }
            catch (err) {
                config_1.log.warn('Contact', 'avatar() exception: %s', err.stack);
                config_1.Raven.captureException(err);
                throw err;
            }
        });
    }
    get(prop) { return this.obj && this.obj[prop]; }
    isReady() {
        return !!(this.obj && this.obj.id && this.obj.name);
    }
    // public refresh() {
    //   log.warn('Contact', 'refresh() DEPRECATED. use reload() instead.')
    //   return this.reload()
    // }
    /**
     * Force reload data for Contact
     *
     * @returns {Promise<this>}
     *
     * @example
     * ```ts
     * await contact.refresh()
     * ```
     */
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isReady()) {
                this.dirtyObj = this.obj;
            }
            this.obj = null;
            return this.ready();
        });
    }
    // public ready() {
    //   log.warn('Contact', 'ready() DEPRECATED. use load() instead.')
    //   return this.load()
    // }
    ready(contactGetter) {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.silly('Contact', 'ready(' + (contactGetter ? typeof contactGetter : '') + ')');
            if (!this.id) {
                const e = new Error('ready() call on an un-inited contact');
                throw e;
            }
            if (this.isReady()) {
                return Promise.resolve(this);
            }
            if (!contactGetter) {
                config_1.log.silly('Contact', 'get contact via ' + config_1.config.puppetInstance().constructor.name);
                contactGetter = config_1.config.puppetInstance()
                    .getContact.bind(config_1.config.puppetInstance());
            }
            if (!contactGetter) {
                throw new Error('no contatGetter');
            }
            try {
                const rawObj = yield contactGetter(this.id);
                config_1.log.silly('Contact', `contactGetter(${this.id}) resolved`);
                this.rawObj = rawObj;
                this.obj = this.parse(rawObj);
                return this;
            }
            catch (e) {
                config_1.log.error('Contact', `contactGetter(${this.id}) exception: %s`, e.message);
                config_1.Raven.captureException(e);
                throw e;
            }
        });
    }
    dumpRaw() {
        console.error('======= dump raw contact =======');
        Object.keys(this.rawObj).forEach(k => console.error(`${k}: ${this.rawObj[k]}`));
    }
    dump() {
        console.error('======= dump contact =======');
        Object.keys(this.obj).forEach(k => console.error(`${k}: ${this.obj && this.obj[k]}`));
    }
    /**
     * Check if contact is self
     *
     * @returns {boolean} True for contact is self, False for contact is others
     *
     * @example
     * ```ts
     * const isSelf = contact.self()
     * ```
     */
    self() {
        const userId = config_1.config.puppetInstance()
            .userId;
        const selfId = this.id;
        if (!userId || !selfId) {
            throw new Error('no user or no self id');
        }
        return selfId === userId;
    }
    /**
     * find contact by `name` or `alias`
     *
     * If use Contact.findAll() get the contact list of the bot.
     *
     * #### definition
     * - `name` the name-string set by user-self, should be called name
     * - `alias` the name-string set by bot for others, should be called alias
     *
     * @static
     * @param {ContactQueryFilter} [queryArg]
     * @returns {Promise<Contact[]>}
     *
     * @example
     * ```ts
     * // get the contact list of the bot
     * const contactList = await Contact.findAll()
     * // find allof the contacts whose name is 'ruirui'
     * const contactList = await Contact.findAll({name: 'ruirui'})
     * // find allof the contacts whose alias is 'lijiarui'
     * const contactList = await Contact.findAll({alias: 'lijiarui'})
     * ```
     */
    static findAll(queryArg) {
        return __awaiter(this, void 0, void 0, function* () {
            let query;
            if (queryArg) {
                if (queryArg.remark) {
                    config_1.log.warn('Contact', 'Contact.findAll({remark:%s}) DEPRECATED, use Contact.findAll({alias:%s}) instead.', queryArg.remark, queryArg.remark);
                    query = { alias: queryArg.remark };
                }
                else {
                    query = queryArg;
                }
            }
            else {
                query = { name: /.*/ };
            }
            // log.verbose('Cotnact', 'findAll({ name: %s })', query.name)
            config_1.log.verbose('Cotnact', 'findAll({ %s })', Object.keys(query)
                .map(k => `${k}: ${query[k]}`)
                .join(', '));
            if (Object.keys(query).length !== 1) {
                throw new Error('query only support one key. multi key support is not availble now.');
            }
            let filterKey = Object.keys(query)[0];
            let filterValue = query[filterKey];
            const keyMap = {
                name: 'NickName',
                alias: 'RemarkName',
            };
            filterKey = keyMap[filterKey];
            if (!filterKey) {
                throw new Error('unsupport filter key');
            }
            if (!filterValue) {
                throw new Error('filterValue not found');
            }
            /**
             * must be string because we need inject variable value
             * into code as variable name
             */
            let filterFunction;
            if (filterValue instanceof RegExp) {
                filterFunction = `(function (c) { return ${filterValue.toString()}.test(c.${filterKey}) })`;
            }
            else if (typeof filterValue === 'string') {
                filterValue = filterValue.replace(/'/g, '\\\'');
                filterFunction = `(function (c) { return c.${filterKey} === '${filterValue}' })`;
            }
            else {
                throw new Error('unsupport name type');
            }
            const contactList = yield config_1.config.puppetInstance()
                .contactFind(filterFunction)
                .catch(e => {
                config_1.log.error('Contact', 'findAll() rejected: %s', e.message);
                config_1.Raven.captureException(e);
                return []; // fail safe
            });
            yield Promise.all(contactList.map(c => c.ready()));
            return contactList;
        });
    }
    /**
     * GET / SET / DELETE the alias for a contact
     *
     * @param {(none | string | null)} newAlias ,
     * @returns {(string | null | Promise<boolean>)}
     *
     * @example GET the alias for a contact
     * ```ts
     * const alias = contact.alias()
     * if (alias === null) {
     *   console.log('You have not yet set any alias for contact ' + contact.name())
     * } else {
     *   console.log('You have already set an alias for contact ' + contact.name() + ':' + alias)
     * }
     * ```
     *
     * @example SET the alias for a contact
     * ```ts
     * const ret = await contact.alias('lijiarui')
     * if (ret) {
     *   console.log(`change ${contact.name()}'s alias successfully!`)
     * } else {
     *   console.error('failed to change ${contact.name()}'s alias!')
     * }
     * ```
     *
     * @example DELETE the alias for a contact
     * ```ts
     * const ret = await contact.alias(null)
     * if (ret) {
     *   console.log(`delete ${contact.name()}'s alias successfully!`)
     * } else {
     *   console.log(`failed to delete ${contact.name()}'s alias!`)
     * }
     * ```
     */
    alias(newAlias) {
        config_1.log.silly('Contact', 'alias(%s)', newAlias || '');
        if (newAlias === undefined) {
            return this.obj && this.obj.alias || null;
        }
        return config_1.config.puppetInstance()
            .contactAlias(this, newAlias)
            .then(ret => {
            if (ret) {
                if (this.obj) {
                    this.obj.alias = newAlias;
                }
                else {
                    config_1.log.error('Contact', 'alias() without this.obj?');
                }
            }
            else {
                config_1.log.warn('Contact', 'alias(%s) fail', newAlias);
            }
            return ret;
        })
            .catch(e => {
            config_1.log.error('Contact', 'alias(%s) rejected: %s', newAlias, e.message);
            config_1.Raven.captureException(e);
            return false; // fail safe
        });
    }
    // function should be deprecated
    remark(newRemark) {
        config_1.log.warn('Contact', 'remark(%s) DEPRECATED, use alias(%s) instead.');
        config_1.log.silly('Contact', 'remark(%s)', newRemark || '');
        switch (newRemark) {
            case undefined:
                return this.alias();
            case null:
                return this.alias(null);
            default:
                return this.alias(newRemark);
        }
    }
    /**
     * try to find a contact by filter: {name: string | RegExp} / {alias: string | RegExp}
     * @description Find contact by name or alias, if the result more than one, return the first one.
     * @static
     * @param {ContactQueryFilter} query
     * @returns {(Promise<Contact | null>)} If can find the contact, return Contact, or return null
     *
     * @example
     * ```ts
     * const contactFindByName = await Contact.find({ name:"ruirui"} )
     * const contactFindByAlias = await Contact.find({ alias:"lijiarui"} )
     * ```
     */
    static find(query) {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('Contact', 'find(%s)', JSON.stringify(query));
            const contactList = yield Contact.findAll(query);
            if (!contactList || !contactList.length) {
                return null;
            }
            if (contactList.length > 1) {
                config_1.log.warn('Contact', 'function find(%s) get %d contacts, use the first one by default', JSON.stringify(query), contactList.length);
            }
            return contactList[0];
        });
    }
    /**
     * Load data for Contact by id
     *
     * @static
     * @param {string} id
     * @returns {Contact}
     *
     * @example
     * ```ts
     * // fake: contactId = @0bb3e4dd746fdbd4a80546aef66f4085
     * const contact = Contact.load('@0bb3e4dd746fdbd4a80546aef66f4085')
     * ```
     */
    static load(id) {
        if (!id || typeof id !== 'string') {
            throw new Error('Contact.load(): id not found');
        }
        if (!(id in Contact.pool)) {
            Contact.pool[id] = new Contact(id);
        }
        return Contact.pool[id];
    }
    say(textOrMedia) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = textOrMedia instanceof message_1.MediaMessage ? textOrMedia.filename() : textOrMedia;
            config_1.log.verbose('Contact', 'say(%s)', content);
            const bot = wechaty_1.Wechaty.instance();
            const user = bot.self();
            if (!user) {
                throw new Error('no user');
            }
            let m;
            if (typeof textOrMedia === 'string') {
                m = new message_1.Message();
                m.content(textOrMedia);
            }
            else if (textOrMedia instanceof message_1.MediaMessage) {
                m = textOrMedia;
            }
            else {
                throw new Error('not support args');
            }
            m.from(user);
            m.to(this);
            config_1.log.silly('Contact', 'say() from: %s to: %s content: %s', user.name(), this.name(), content);
            return yield bot.send(m);
        });
    }
}
Contact.pool = new Map();
exports.Contact = Contact;
// Contact.search = function(options) {
//   if (options.name) {
//     const regex = new RegExp(options.name)
//     return Object.keys(Contact.pool)
//     .filter(k => regex.test(Contact.pool[k].name()))
//     .map(k => Contact.pool[k])
//   }
//   return []
// }
exports.default = Contact;
//# sourceMappingURL=contact.js.map