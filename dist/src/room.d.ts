/// <reference types="node" />
import { EventEmitter } from 'events';
import { Sayable } from './config';
import Contact from './contact';
import { MediaMessage } from './message';
export interface RoomRawMember {
    UserName: string;
    NickName: string;
    DisplayName: string;
}
export interface RoomRawObj {
    UserName: string;
    EncryChatRoomId: string;
    NickName: string;
    OwnerUin: number;
    ChatRoomOwner: string;
    MemberList?: RoomRawMember[];
}
export declare type RoomEventName = 'join' | 'leave' | 'topic' | 'EVENT_PARAM_ERROR';
export interface RoomQueryFilter {
    topic: string | RegExp;
}
export interface MemberQueryFilter {
    name?: string;
    alias?: string;
    roomAlias?: string;
    contactAlias?: string;
}
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
export declare class Room extends EventEmitter implements Sayable {
    id: string;
    private static pool;
    private dirtyObj;
    private obj;
    private rawObj;
    constructor(id: string);
    toString(): string;
    toStringEx(): string;
    isReady(): boolean;
    refresh(): Promise<void>;
    private readyAllMembers(memberList);
    ready(contactGetter?: (id: string) => Promise<any>): Promise<Room>;
    on(event: 'leave', listener: (this: Room, leaver: Contact) => void): this;
    on(event: 'join', listener: (this: Room, inviteeList: Contact[], inviter: Contact) => void): this;
    on(event: 'topic', listener: (this: Room, topic: string, oldTopic: string, changer: Contact) => void): this;
    on(event: 'EVENT_PARAM_ERROR', listener: () => void): this;
    say(mediaMessage: MediaMessage): any;
    say(content: string): any;
    say(content: string, replyTo: Contact): any;
    say(content: string, replyTo: Contact[]): any;
    get(prop: any): string;
    private parse(rawObj);
    private parseMap(parseContent, memberList?);
    dumpRaw(): void;
    dump(): void;
    add(contact: Contact): Promise<number>;
    del(contact: Contact): Promise<number>;
    private delLocal(contact);
    quit(): void;
    /**
     * get topic
     */
    topic(): string;
    /**
     * set topic
     */
    topic(newTopic: string): void;
    /**
     * should be deprecated
     * @deprecated
     */
    nick(contact: Contact): string | null;
    /**
     * return contact's roomAlias in the room, the same as roomAlias
     * @param {Contact} contact
     * @returns {string | null} If a contact has an alias in room, return string, otherwise return null
     */
    alias(contact: Contact): string | null;
    roomAlias(contact: Contact): string | null;
    has(contact: Contact): boolean;
    owner(): Contact | null;
    /**
     * find member by name | roomAlias(alias) | contactAlias
     * when use memberAll(name:string), return all matched members, including name, roomAlias, contactAlias
     */
    memberAll(name: string): Contact[];
    memberAll(filter: MemberQueryFilter): Contact[];
    member(name: string): Contact | null;
    member(filter: MemberQueryFilter): Contact | null;
    memberList(): Contact[];
    static create(contactList: Contact[], topic?: string): Promise<Room>;
    static findAll(query?: RoomQueryFilter): Promise<Room[]>;
    /**
     * try to find a room by filter: {topic: string | RegExp}
     * @param {RoomQueryFilter} query
     * @returns {Promise<Room | null>} If can find the room, return Room, or return null
     */
    static find(query: RoomQueryFilter): Promise<Room | null>;
    /**
     * @todo document me
     */
    static load(id: string): Room;
}
export default Room;
