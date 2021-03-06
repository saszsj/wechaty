/// <reference types="node" />
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
import { EventEmitter } from 'events';
import { HeadName, PuppetName, Sayable } from './config';
import { Contact } from './contact';
import { FriendRequest } from './friend-request';
import { Message, MediaMessage } from './message';
import { Puppet } from './puppet';
import { Room } from './room';
export interface PuppetSetting {
    head?: HeadName;
    puppet?: PuppetName;
    profile?: string;
}
export declare type WechatyEventName = 'error' | 'friend' | 'heartbeat' | 'login' | 'logout' | 'message' | 'room-join' | 'room-leave' | 'room-topic' | 'scan' | 'EVENT_PARAM_ERROR';
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
export declare class Wechaty extends EventEmitter implements Sayable {
    private setting;
    /**
     * singleton _instance
     * @private
     */
    private static _instance;
    /**
     * the puppet
     * @private
     */
    puppet: Puppet | null;
    /**
     * the state
     * @private
     */
    private state;
    /**
     * the uuid
     * @private
     */
    uuid: string;
    /**
     * get the singleton instance of Wechaty
     */
    static instance(setting?: PuppetSetting): Wechaty;
    /**
     * @private
     */
    private constructor(setting?);
    /**
     * @private
     */
    toString(): string;
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
    static version(forceNpm?: boolean): string;
    version(forceNpm?: any): string;
    /**
     * @todo document me
     * @returns {Contact}
     * @deprecated
     */
    user(): Contact;
    /**
     * @private
     */
    reset(reason?: string): Promise<void>;
    /**
     * @todo document me
     */
    init(): Promise<void>;
    /**
     * @listens Wechaty#error
     * @param   {string}    [event='error'] - the `error` event name
     * @param   {Function}  listener        - (error) => void callback function
     * @return  {Wechaty}                   - this for chain
     */
    on(event: 'error', listener: (this: Wechaty, error: Error) => void): this;
    /**
     * @todo document me
     */
    on(event: 'friend', listener: (this: Wechaty, friend: Contact, request?: FriendRequest) => void): this;
    /**
     * @todo document me
     */
    on(event: 'heartbeat', listener: (this: Wechaty, data: any) => void): this;
    /**
     * @todo document me
     */
    on(event: 'logout', listener: (this: Wechaty, user: Contact) => void): this;
    /**
     * @todo document me
     */
    on(event: 'login', listener: (this: Wechaty, user: Contact) => void): this;
    /**
     * @todo document me
     */
    on(event: 'message', listener: (this: Wechaty, message: Message) => void): this;
    /**
     * @todo document me
     */
    on(event: 'room-join', listener: (this: Wechaty, room: Room, inviteeList: Contact[], inviter: Contact) => void): this;
    /**
     * @todo document me
     */
    on(event: 'room-leave', listener: (this: Wechaty, room: Room, leaverList: Contact[]) => void): this;
    /**
     * @todo document me
     */
    on(event: 'room-topic', listener: (this: Wechaty, room: Room, topic: string, oldTopic: string, changer: Contact) => void): this;
    /**
     * @todo document me
     */
    on(event: 'scan', listener: (this: Wechaty, url: string, code: number) => void): this;
    /**
     * @todo document me
     */
    on(event: 'EVENT_PARAM_ERROR', listener: () => void): this;
    /**
     * @todo document me
     * @private
     */
    initPuppet(): Promise<Puppet>;
    /**
     * @todo document me
     */
    quit(): Promise<void>;
    /**
     * @todo document me
     */
    logout(): Promise<void>;
    /**
     * get current user
     * @returns {Contact} current logined user
     */
    self(): Contact;
    /**
     * @todo document me
     */
    send(message: Message | MediaMessage): Promise<boolean>;
    /**
     * @todo document me
     */
    say(content: string): Promise<boolean>;
    /**
     * @todo document me
     * @static
     *
     */
    static sleep(millisecond: number): Promise<void>;
    /**
     * @todo document me
     * @private
     */
    ding(): Promise<never>;
}
export default Wechaty;
