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
const config_1 = require("./config");
ava_1.test('important variables', t => {
    t.true('head' in config_1.Config, 'should exist `head` in Config');
    t.true('puppet' in config_1.Config, 'should exist `puppet` in Config');
    t.true('apihost' in config_1.Config, 'should exist `apihost` in Config');
    t.true('port' in config_1.Config, 'should exist `port` in Config');
    t.true('profile' in config_1.Config, 'should exist `profile` in Config');
    t.true('token' in config_1.Config, 'should exist `token` in Config');
    t.truthy(config_1.Config.DEFAULT_PUPPET, 'should export DEFAULT_PUPPET');
    t.truthy(config_1.Config.DEFAULT_PORT, 'should export DEFAULT_PORT');
    t.truthy(config_1.Config.DEFAULT_PROFILE, 'should export DEFAULT_PROFILE');
    t.truthy(config_1.Config.DEFAULT_HEAD, 'should export DEFAULT_HEAD');
    t.truthy(config_1.Config.DEFAULT_PROTOCOL, 'should export DEFAULT_PROTOCOL');
    t.truthy(config_1.Config.DEFAULT_APIHOST, 'should export DEFAULT_APIHOST');
    t.truthy(config_1.Config.CMD_CHROMIUM, 'should export CMD_CHROMIUM');
});
ava_1.test('validApiHost()', t => {
    const OK_APIHOSTS = [
        'api.wechaty.io',
        'wechaty.io:8080',
    ];
    const ERR_APIHOSTS = [
        'https://api.wechaty.io',
        'wechaty.io/',
    ];
    OK_APIHOSTS.forEach(apihost => {
        t.notThrows(() => {
            config_1.Config.validApiHost(apihost);
        });
    }, 'should not row for right apihost');
    ERR_APIHOSTS.forEach(apihost => {
        t.throws(() => {
            config_1.Config.validApiHost(apihost);
        });
    }, 'should throw for error apihost');
});
ava_1.test('puppetInstance()', t => {
    t.throws(() => {
        config_1.Config.puppetInstance();
    }, Error, 'should throw when not initialized');
    const EXPECTED = { userId: 'test' };
    const mockPuppet = EXPECTED;
    config_1.Config.puppetInstance(mockPuppet);
    const instance = config_1.Config.puppetInstance();
    t.deepEqual(instance, EXPECTED, 'should equal with initialized data');
    config_1.Config.puppetInstance(null);
    t.throws(() => {
        config_1.Config.puppetInstance();
    }, Error, 'should throw after set to null');
});
ava_1.test('isDocker', t => {
    t.true('isDocker' in config_1.Config, 'should identify docker env by `isDocker`');
    if ('C9_PORT' in process.env) {
        t.is(config_1.Config.isDocker, false, 'should not in docker mode in Cloud9 IDE');
    }
    else if (require('is-ci')) {
        t.is(config_1.Config.isDocker, false, 'should not in docker mode in Continuous Integeration System');
    }
    else {
        // a custom running envioronment, maybe docker, maybe not
    }
});
//# sourceMappingURL=config.spec.js.map