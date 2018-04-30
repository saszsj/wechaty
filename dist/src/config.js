"use strict";
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
const fs = require("fs");
const os = require("os");
const path = require("path");
/**
 * Raven.io
 */
const Raven = require("raven");
exports.Raven = Raven;
Raven.disableConsoleAlerts();
Raven
    .config(process.env.NODE_ENV === 'production'
    && 'https://f6770399ee65459a82af82650231b22c:d8d11b283deb441e807079b8bb2c45cd@sentry.io/179672', {
    release: require('../package.json').version,
    tags: {
        git_commit: 'c0deb10c4',
        platform: !!process.env['WECHATY_DOCKER']
            ? 'docker'
            : os.platform(),
    },
})
    .install();
/*
try {
    doSomething(a[0])
} catch (e) {
    Raven.captureException(e)
}

Raven.context(function () {
  doSomething(a[0])
})
 */
// const isCi      = require('is-ci')
// const isDocker  = require('is-docker')
const brolog_1 = require("brolog");
exports.log = brolog_1.log;
const logLevel = process.env['WECHATY_LOG'];
if (logLevel) {
    brolog_1.log.level(logLevel.toLowerCase());
    brolog_1.log.silly('Brolog', 'WECHATY_LOG set level to %s', logLevel);
}
/**
 * to handle unhandled exceptions
 */
if (/verbose|silly/i.test(logLevel)) {
    brolog_1.log.info('Config', 'registering process.on("unhandledRejection") for development/debug');
    process.on('unhandledRejection', (reason, promise) => {
        brolog_1.log.error('Config', '###########################');
        brolog_1.log.error('Config', 'unhandledRejection: %s %s', reason, promise);
        brolog_1.log.error('Config', '###########################');
        promise.catch(err => {
            brolog_1.log.error('Config', 'unhandledRejection::catch(%s)', err.message);
            console.error('Config', err); // I don't know if log.error has similar full trace print support like console.error
        });
    });
}
/* tslint:disable:variable-name */
/* tslint:disable:no-var-requires */
exports.config = require('../package.json').wechaty;
/**
 * 1. ENVIRONMENT VARIABLES + PACKAGES.JSON (default)
 */
Object.assign(exports.config, {
    apihost: process.env['WECHATY_APIHOST'] || exports.config.DEFAULT_APIHOST,
    head: process.env['WECHATY_HEAD'] || exports.config.DEFAULT_HEAD,
    puppet: process.env['WECHATY_PUPPET'] || exports.config.DEFAULT_PUPPET,
    validApiHost,
});
function validApiHost(apihost) {
    if (/^[a-zA-Z0-9\.\-\_]+:?[0-9]*$/.test(apihost)) {
        return true;
    }
    throw new Error('validApiHost() fail for ' + apihost);
}
validApiHost(exports.config.apihost);
/**
 * 2. ENVIRONMENT VARIABLES (only)
 */
Object.assign(exports.config, {
    port: process.env['WECHATY_PORT'] || null,
    profile: process.env['WECHATY_PROFILE'] || null,
    token: process.env['WECHATY_TOKEN'] || null,
    debug: !!(process.env['WECHATY_DEBUG']) || false,
});
/**
 * 3. Service Settings
 */
Object.assign(exports.config, {
    // get PORT form cloud service env, ie: heroku
    httpPort: process.env['PORT'] || process.env['WECHATY_PORT'] || exports.config.DEFAULT_PORT,
});
/**
 * 4. Envioronment Identify
 */
Object.assign(exports.config, {
    dockerMode: !!process.env['WECHATY_DOCKER'],
    isGlobal: isWechatyInstalledGlobal(),
});
function isWechatyInstalledGlobal() {
    /**
     * TODO:
     * 1. check /node_modules/wechaty
     * 2. return true if exists
     * 3. otherwise return false
     */
    return false;
}
function puppetInstance(instance) {
    if (instance === undefined) {
        if (!this._puppetInstance) {
            throw new Error('no puppet instance');
        }
        return this._puppetInstance;
    }
    else if (instance === null) {
        brolog_1.log.verbose('Config', 'puppetInstance(null)');
        this._puppetInstance = null;
        return;
    }
    brolog_1.log.verbose('Config', 'puppetInstance(%s)', instance.constructor.name);
    this._puppetInstance = instance;
    return;
}
function gitVersion() {
    const dotGitPath = path.join(__dirname, '..', '.git'); // only for ts-node, not for dist
    // const gitLogArgs  = ['log', '--oneline', '-1']
    // TODO: use git rev-parse HEAD ?
    const gitArgs = ['rev-parse', 'HEAD'];
    try {
        // Make sure this is a Wechaty repository
        fs.statSync(dotGitPath).isDirectory();
        const ss = require('child_process')
            .spawnSync('git', gitArgs, { cwd: __dirname });
        if (ss.status !== 0) {
            throw new Error(ss.error);
        }
        const revision = ss.stdout
            .toString()
            .trim()
            .slice(0, 7);
        return revision;
    }
    catch (e) {
        /**
         *  1. .git not exist
         *  2. git log fail
         */
        brolog_1.log.silly('Wechaty', 'version() form development environment is not availble: %s', e.message);
        return null;
    }
}
function npmVersion() {
    try {
        return require('../package.json').version;
    }
    catch (e) {
        brolog_1.log.error('Wechaty', 'npmVersion() exception %s', e.message);
        Raven.captureException(e);
        return '0.0.0';
    }
}
Object.assign(exports.config, {
    gitVersion,
    npmVersion,
    puppetInstance,
});
exports.default = exports.config;
//# sourceMappingURL=config.js.map