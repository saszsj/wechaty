/// <reference types="node" />
import { EventEmitter } from 'events';
import { StateSwitch } from 'state-switch';
import { Sayable } from './config';
import Contact from './contact';
import { Message, MediaMessage } from './message';
import Room from './room';
/**
 * Abstract Puppet Class
 */
export declare abstract class Puppet extends EventEmitter implements Sayable {
    userId: string | null;
    user: Contact | null;
    abstract getContact(id: string): Promise<any>;
    state: StateSwitch<"live", "dead">;
    constructor();
    abstract init(): Promise<void>;
    abstract self(): Contact;
    abstract send(message: Message | MediaMessage): Promise<boolean>;
    abstract say(content: string): Promise<boolean>;
    abstract reset(reason?: string): void;
    abstract logout(): Promise<void>;
    abstract quit(): Promise<void>;
    abstract ding(): Promise<string>;
    /**
     * FriendRequest
     */
    abstract friendRequestSend(contact: Contact, hello?: string): Promise<any>;
    abstract friendRequestAccept(contact: Contact, ticket: string): Promise<any>;
    /**
     * Room
     */
    abstract roomAdd(room: Room, contact: Contact): Promise<number>;
    abstract roomDel(room: Room, contact: Contact): Promise<number>;
    abstract roomTopic(room: Room, topic: string): Promise<string>;
    abstract roomCreate(contactList: Contact[], topic?: string): Promise<Room>;
    abstract roomFind(filterFunc: string): Promise<Room[]>;
    /**
     * Contact
     */
    abstract contactFind(filterFunc: string): Promise<Contact[]>;
    abstract contactAlias(contact: Contact, alias: string | null): Promise<boolean>;
}
export default Puppet;
