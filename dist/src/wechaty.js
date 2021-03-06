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
const state_switch_1 = require("state-switch");
const config_1 = require("./config");
const _1 = require("./puppet-web/");
const util_lib_1 = require("./util-lib");
/**
 *
 * Wechaty: Wechat for ChatBots.
 * Connect ChatBots
 *
 * Class Wechaty
 *
 * Licenst: ISC
 * https://github.com/zixia/wechaty
 *
 *
 * **Example**
 *
 * ```ts
 * // The World's Shortest ChatBot Code: 6 lines of JavaScript
 * const { Wechaty } = require('wechaty')
 *
 * Wechaty.instance() // Singleton
 * .on('scan', (url, code) => console.log(`Scan QR Code to login: ${code}\n${url}`))
 * .on('login',       user => console.log(`User ${user} logined`))
 * .on('message',  message => console.log(`Message: ${message}`))
 * .init()
 * ```
 * @see The <a href="https://github.com/lijiarui/wechaty-getting-started">Wechaty Starter Project</a>
 */
class Wechaty extends events_1.EventEmitter {
    /**
     * @private
     */
    constructor(setting = {}) {
        super();
        this.setting = setting;
        /**
         * the state
         * @private
         */
        this.state = new state_switch_1.StateSwitch('Wechaty', 'standby', config_1.log);
        config_1.log.verbose('Wechaty', 'contructor()');
        setting.head = setting.head || config_1.config.head;
        setting.puppet = setting.puppet || config_1.config.puppet;
        setting.profile = setting.profile || config_1.config.profile;
        // setting.port    = setting.port    || Config.port
        if (setting.profile) {
            setting.profile = /\.wechaty\.json$/i.test(setting.profile)
                ? setting.profile
                : setting.profile + '.wechaty.json';
        }
        this.uuid = util_lib_1.UtilLib.guid();
    }
    /**
     * get the singleton instance of Wechaty
     */
    static instance(setting) {
        if (setting && this._instance) {
            throw new Error('there has already a instance. no params will be allowed any more');
        }
        if (!this._instance) {
            this._instance = new Wechaty(setting);
        }
        return this._instance;
    }
    /**
     * @private
     */
    toString() { return 'Class Wechaty(' + this.setting.puppet + ')'; }
    /**
     * Return version of Wechaty
     *
     * @param {boolean} [forceNpm=false]  - if set to true, will only return the version in package.json.
     *                                      otherwise will return git commit hash if .git exists.
     * @returns {string}                  - the version number
     * @example
     *  console.log(Wechaty.instance().version())
     *  // '#git[af39df]'
     *  console.log(Wechaty.instance().version(true))
     *  // '0.7.9'
     */
    static version(forceNpm = false) {
        if (!forceNpm) {
            const revision = config_1.config.gitVersion();
            if (revision) {
                return `#git[${revision}]`;
            }
        }
        return config_1.config.npmVersion();
    }
    version(forceNpm) {
        return Wechaty.version(forceNpm);
    }
    /**
     * @todo document me
     * @returns {Contact}
     * @deprecated
     */
    user() {
        config_1.log.warn('Wechaty', 'user() DEPRECATED. use self() instead.');
        if (!this.puppet || !this.puppet.user) {
            throw new Error('no user');
        }
        return this.puppet.user;
    }
    /**
     * @private
     */
    reset(reason) {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('Wechaty', 'reset() because %s', reason);
            if (!this.puppet) {
                throw new Error('no puppet');
            }
            yield this.puppet.reset(reason);
            return;
        });
    }
    /**
     * @todo document me
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.info('Wechaty', 'v%s initializing...', this.version());
            config_1.log.verbose('Wechaty', 'puppet: %s', this.setting.puppet);
            config_1.log.verbose('Wechaty', 'head: %s', this.setting.head);
            config_1.log.verbose('Wechaty', 'profile: %s', this.setting.profile);
            config_1.log.verbose('Wechaty', 'uuid: %s', this.uuid);
            if (this.state.current() === 'ready') {
                config_1.log.error('Wechaty', 'init() already inited. return and do nothing.');
                return;
            }
            this.state.target('ready');
            this.state.current('ready', false);
            try {
                yield this.initPuppet();
            }
            catch (e) {
                config_1.log.error('Wechaty', 'init() exception: %s', e && e.message);
                config_1.Raven.captureException(e);
                throw e;
            }
            this.state.current('ready');
            return;
        });
    }
    /**
     * @todo document me
     */
    on(event, listener) {
        config_1.log.verbose('Wechaty', 'addListener(%s, %s)', event, typeof listener);
        // const thisWithSay: Sayable = {
        //   say: (content: string) => {
        //     return Config.puppetInstance()
        //                   .say(content)
        //   }
        // }
        super.on(event, listener); // `this: Wechaty` is Sayable
        // (...args) => {
        //
        //   return listener.apply(this, args)
        // })
        return this;
    }
    /**
     * @todo document me
     * @private
     */
    initPuppet() {
        return __awaiter(this, void 0, void 0, function* () {
            let puppet;
            if (!this.setting.head) {
                throw new Error('no head');
            }
            switch (this.setting.puppet) {
                case 'web':
                    puppet = new _1.PuppetWeb({
                        head: this.setting.head,
                        profile: this.setting.profile,
                    });
                    break;
                default:
                    throw new Error('Puppet unsupport(yet?): ' + this.setting.puppet);
            }
            const eventList = [
                'error',
                'friend',
                'heartbeat',
                'login',
                'logout',
                'message',
                'room-join',
                'room-leave',
                'room-topic',
                'scan',
            ];
            eventList.map(e => {
                // https://strongloop.com/strongblog/an-introduction-to-javascript-es6-arrow-functions/
                // We’ve lost () around the argument list when there’s just one argument (rest arguments are an exception, eg (...args) => ...)
                puppet.on(e, (...args) => {
                    // this.emit(e, data)
                    this.emit.apply(this, [e, ...args]);
                });
            });
            // set puppet before init, because we need this.puppet if we quit() before init() finish
            this.puppet = puppet; // force to use base class Puppet interface for better encapsolation
            // set puppet instance to Wechaty Static variable, for using by Contact/Room/Message/FriendRequest etc.
            config_1.config.puppetInstance(puppet);
            yield puppet.init();
            return puppet;
        });
    }
    /**
     * @todo document me
     */
    quit() {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('Wechaty', 'quit()');
            if (this.state.current() !== 'ready' || this.state.inprocess()) {
                const err = new Error('quit() must run on a inited instance.');
                config_1.log.error('Wechaty', err.message);
                throw err;
            }
            this.state.target('standby');
            this.state.current('standby', false);
            if (!this.puppet) {
                config_1.log.warn('Wechaty', 'quit() without this.puppet');
                return;
            }
            const puppetBeforeDie = this.puppet;
            this.puppet = null;
            config_1.config.puppetInstance(null);
            yield puppetBeforeDie.quit()
                .catch(e => {
                config_1.log.error('Wechaty', 'quit() exception: %s', e.message);
                config_1.Raven.captureException(e);
                throw e;
            });
            this.state.current('standby');
            return;
        });
    }
    /**
     * @todo document me
     */
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.puppet) {
                throw new Error('no puppet');
            }
            yield this.puppet.logout()
                .catch(e => {
                config_1.log.error('Wechaty', 'logout() exception: %s', e.message);
                config_1.Raven.captureException(e);
                throw e;
            });
            return;
        });
    }
    /**
     * get current user
     * @returns {Contact} current logined user
     */
    self() {
        if (!this.puppet) {
            throw new Error('Wechaty.self() no puppet');
        }
        return this.puppet.self();
    }
    /**
     * @todo document me
     */
    send(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.puppet) {
                throw new Error('no puppet');
            }
            return yield this.puppet.send(message)
                .catch(e => {
                config_1.log.error('Wechaty', 'send() exception: %s', e.message);
                config_1.Raven.captureException(e);
                throw e;
            });
        });
    }
    /**
     * @todo document me
     */
    say(content) {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('Wechaty', 'say(%s)', content);
            if (!this.puppet) {
                throw new Error('no puppet');
            }
            return yield this.puppet.say(content);
        });
    }
    /**
     * @todo document me
     * @static
     *
     */
    static sleep(millisecond) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise(resolve => {
                setTimeout(resolve, millisecond);
            });
        });
    }
    /**
     * @todo document me
     * @private
     */
    ding() {
        if (!this.puppet) {
            return Promise.reject(new Error('wechaty cant ding coz no puppet'));
        }
        return this.puppet.ding() // should return 'dong'
            .catch(e => {
            config_1.log.error('Wechaty', 'ding() exception: %s', e.message);
            config_1.Raven.captureException(e);
            throw e;
        });
    }
}
exports.Wechaty = Wechaty;
exports.default = Wechaty;
//# sourceMappingURL=wechaty.js.map