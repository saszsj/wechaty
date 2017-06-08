/// <reference types="node" />
/**
 *
 * wechaty: Wechat for Bot. and for human who talk to bot/robot
 *
 * Class PuppetWeb
 *
 * use to control wechat in web browser.
 *
 * Licenst: ISC
 * https://github.com/zixia/wechaty
 *
 *
 * Class PuppetWeb
 *
 */
import { HeadName, ScanInfo } from '../config';
import Contact from '../contact';
import { Message, MediaMessage } from '../message';
import Puppet from '../puppet';
import Room from '../room';
import Bridge from './bridge';
import Browser from './browser';
import Server from './server';
export interface PuppetWebSetting {
    head?: HeadName;
    profile?: string;
}
export declare class PuppetWeb extends Puppet {
    setting: PuppetWebSetting;
    browser: Browser;
    bridge: Bridge;
    server: Server;
    scan: ScanInfo | null;
    private port;
    lastScanEventTime: number;
    watchDogLastSaveSession: number;
    watchDogTimer: NodeJS.Timer | null;
    watchDogTimerTime: number;
    constructor(setting?: PuppetWebSetting);
    toString(): string;
    init(): Promise<void>;
    quit(): Promise<void>;
    initBrowser(): Promise<void>;
    initBridge(): Promise<void>;
    private initServer();
    reset(reason?: string): void;
    logined(): boolean;
    /**
     * get self contact
     */
    self(): Contact;
    private getBaseRequest();
    private uploadMedia(mediaMessage, toUserName);
    sendMedia(message: MediaMessage): Promise<boolean>;
    send(message: Message | MediaMessage): Promise<boolean>;
    /**
     * Bot say...
     * send to `filehelper` for notice / log
     */
    say(content: string): Promise<boolean>;
    /**
     * logout from browser, then server will emit `logout` event
     */
    logout(): Promise<void>;
    getContact(id: string): Promise<any>;
    ding(data?: any): Promise<string>;
    contactAlias(contact: Contact, remark: string | null): Promise<boolean>;
    contactFind(filterFunc: string): Promise<Contact[]>;
    roomFind(filterFunc: string): Promise<Room[]>;
    roomDel(room: Room, contact: Contact): Promise<number>;
    roomAdd(room: Room, contact: Contact): Promise<number>;
    roomTopic(room: Room, topic: string): Promise<string>;
    roomCreate(contactList: Contact[], topic: string): Promise<Room>;
    /**
     * FriendRequest
     */
    friendRequestSend(contact: Contact, hello: string): Promise<boolean>;
    friendRequestAccept(contact: Contact, ticket: string): Promise<boolean>;
}
export default PuppetWeb;
