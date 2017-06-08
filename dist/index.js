"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./src/config");
exports.Config = config_1.Config;
exports.log = config_1.log;
const contact_1 = require("./src/contact");
exports.Contact = contact_1.default;
// ISSUE #70 import { FriendRequest }  from './src/friend-request'
const friend_request_1 = require("./src/puppet-web/friend-request");
exports.FriendRequest = friend_request_1.default;
const io_client_1 = require("./src/io-client");
exports.IoClient = io_client_1.default;
const message_1 = require("./src/message");
exports.Message = message_1.Message;
exports.MediaMessage = message_1.MediaMessage;
exports.MsgType = message_1.MsgType;
const puppet_1 = require("./src/puppet");
exports.Puppet = puppet_1.default;
const _1 = require("./src/puppet-web/");
exports.PuppetWeb = _1.default;
const room_1 = require("./src/room");
exports.Room = room_1.default;
const util_lib_1 = require("./src/util-lib");
exports.UtilLib = util_lib_1.default;
const wechaty_1 = require("./src/wechaty");
exports.Wechaty = wechaty_1.default;
const VERSION = require('./package.json').version;
exports.VERSION = VERSION;
exports.default = wechaty_1.default;
//# sourceMappingURL=index.js.map