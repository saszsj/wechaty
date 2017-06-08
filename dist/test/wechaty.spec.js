"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Wechaty - Wechat for Bot. Connecting ChatBots
 *
 * Licenst: ISC
 * https://github.com/wechaty/wechaty
 *
 */
const ava_1 = require("ava");
const _1 = require("../");
ava_1.test('Wechaty Framework', t => {
    t.truthy(_1.Contact, 'should export Contact');
    t.truthy(_1.FriendRequest, 'should export FriendREquest');
    t.truthy(_1.IoClient, 'should export IoClient');
    t.truthy(_1.Message, 'should export Message');
    t.truthy(_1.Puppet, 'should export Puppet');
    t.truthy(_1.PuppetWeb, 'should export PuppetWeb');
    t.truthy(_1.Room, 'should export Room');
    t.truthy(_1.Wechaty, 'should export Wechaty');
    t.truthy(_1.log, 'should export log');
    const bot = _1.Wechaty.instance();
    t.is(bot.version(true), require('../package.json').version, 'should return version as the same in package.json');
    t.is(_1.VERSION, require('../package.json').version, 'should export version in package.json');
});
ava_1.test('Wechaty Config setting', t => {
    t.truthy(_1.Config, 'should export Config');
    t.truthy(_1.Config.DEFAULT_HEAD, 'should has DEFAULT_HEAD');
    t.truthy(_1.Config.DEFAULT_PUPPET, 'should has DEFAULT_PUPPET');
    t.truthy(_1.Config.DEFAULT_PORT, 'should has DEFAULT_PORT');
});
//# sourceMappingURL=wechaty.spec.js.map