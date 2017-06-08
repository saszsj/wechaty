/**
 * Wechaty - Wechat for Bot. Connecting ChatBots
 *
 * BrowserDriver
 *
 * Licenst: ISC
 * https://github.com/wechaty/wechaty
 *
 */
import { WebDriver } from 'selenium-webdriver';
import { HeadName } from '../config';
export declare class BrowserDriver {
    private head;
    private driver;
    constructor(head: HeadName);
    init(): Promise<void>;
    getWebDriver(): WebDriver;
    private getChromeDriver();
    private getPhantomJsDriver();
    private valid(driver);
    private validDriverExecute(driver);
    private validDriverSession(driver);
    close(): Promise<void>;
    executeAsyncScript(script: string | Function, ...args: any[]): any;
    executeScript(script: string | Function, ...args: any[]): any;
    get(url: string): Promise<void>;
    getSession(): Promise<void>;
    manage(): any;
    navigate(): any;
    quit(): Promise<void>;
}
