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
import { Navigation, Options, WebDriver, promise as promiseManager } from 'selenium-webdriver';
import { HeadName } from '../config';
export declare class BrowserDriver {
    private head;
    driver: WebDriver;
    constructor(head: HeadName);
    init(): Promise<void>;
    getWebDriver(): WebDriver;
    private getChromeDriver();
    private getPhantomJsDriver();
    private valid(driver);
    private validDriverExecute(driver);
    private validDriverSession(driver);
    close(): promiseManager.Promise<void>;
    executeAsyncScript(script: string | Function, ...args: any[]): any;
    executeScript(script: string | Function, ...args: any[]): any;
    get(url: string): Promise<void>;
    getSession(): Promise<void>;
    manage(): Options;
    navigate(): Navigation;
    quit(): Promise<void>;
}
