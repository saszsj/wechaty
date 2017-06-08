/**
 * Wechaty - Wechat for Bot. Connecting ChatBots
 *
 * Licenst: ISC
 * https://github.com/wechaty/wechaty
 *
 */
/**
 * Change `import { ... } from '../../'`
 * to     `import { ... } from 'wechaty'`
 * when you are runing with Docker or NPM instead of Git Source.
 */
import { Contact, Room, Sayable } from '../../';
export declare function onRoomJoin(this: Sayable, room: Room, inviteeList: Contact[], inviter: Contact): Promise<void>;
