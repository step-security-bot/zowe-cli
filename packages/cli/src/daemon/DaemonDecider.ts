/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright Contributors to the Zowe Project.
*
*/

import * as fs from "fs";
import * as net from "net";
import * as os from "os";
import * as path from "path";
import { Imperative } from "@zowe/imperative";
import { DaemonClient } from "./DaemonClient";

// TODO(Kelosky): handle prompting cases from login command
// TODO(Kelosky): prompt* broken - hangs, must restart daemon
// TODO(Kelosky): colors do not come through on some terminals (must be started via `node lib/main --daemon` to see colors)
// TODO(Kelosky): stderr
// TODO(Kelosky): plugins install

/**
 * Initial paramter parse to handle conditionally starting as a persistent process (e.g. daemon mode)
 * @export
 * @class DaemonDecider
 */
export class DaemonDecider {
    /**
     * Undocumented paramter for launching in server mode
     * @private
     * @static
     * @memberof DaemonDecider
     */
    private static readonly DAEMON_KEY = "--daemon";

    /**
     * Hold instance of a running server
     * @private
     * @type {net.Server}
     * @memberof DaemonDecider
     */
    private mServer: net.Server;

    /**
     * Hold current socket path for the server
     * @private
     * @type {number}
     * @memberof DaemonDecider
     */
    private mSocket: string;

    /**
     * Hold current owner for the server
     * @private
     * @type {number}
     * @memberof Processor
     */
    private mUser: string;

    /**
     * Indicator for whether or not to start the server
     * @private
     * @type {boolean}
     * @memberof DaemonDecider
     */
    private mStartServer: boolean;

    /**
     * Creates an instance of DaemonDecider.
     * @param {string[]} mParms
     * @memberof DaemonDecider
     */
    constructor(private mParms: string[]) { }

    /**
     * Initialize our DaemonDecider parse and optionally start the server
     * @memberof DaemonDecider
     */
    public init() {

        this.initialParse();
        if (this.startServer) {
            this.mUser = os.userInfo().username;
            this.mServer = net.createServer((c) => {
                new DaemonClient(c, this.mServer, this.mUser).run();
            });

            this.mServer.on('error', this.error.bind(this));
            this.mServer.on('close', this.close.bind(this));
        }
    }

    /**
     * Method to immediately parse or otherwise start the server for later processing from
     * incoming socket connections.
     * @memberof DaemonDecider
     */
    public runOrUseDaemon() {
        if (this.mServer) {
            if (process.platform !== "win32" && fs.existsSync(this.mSocket)) {
                fs.unlinkSync(this.mSocket);
            }

            // TODO Handle other exit signals?
            process.on("SIGINT", this.close.bind(this));
            process.on("SIGKILL", this.close.bind(this));

            this.mServer.listen(this.mSocket, () => {
                Imperative.api.appLogger.debug(`daemon server bound ${this.mSocket}`);
                Imperative.console.info(`server bound ${this.mSocket}`);
            });
        } else {
            Imperative.parse();
        }
    }

    /**
     * Server close handler
     * @private
     * @memberof DaemonDecider
     */
    private close() {
        Imperative.api.appLogger.debug(`server closed`);
    }

    /**
     * Server error handler
     * @private
     * @param {Error} err
     * @memberof DaemonDecider
     */
    private error(err: Error) {
        Imperative.api.appLogger.error(`daemon server error: ${err.message}`);
        throw err;
    }

    /**
     * Perform initial parsing of undocumented parameters
     * @private
     * @memberof DaemonDecider
     */
    private initialParse() {
        const numOfParms = this.mParms.length - 2;
        // TODO Support ZOWE_CLI_HOME environment variable here and in client
        this.mSocket = (process.platform !== "win32") ? path.join(os.homedir(), ".zowe", "daemon.sock") :
            `\\\\.\\pipe\\${os.userInfo().username}\\ZoweDaemon`;

        if (numOfParms > 0) {
            const parm = this.mParms[2];

            /**
             * NOTE(Kelosky): For now, we use an undocumented paramter `--daemon`.  If found first,
             * we bypass `yargs` and begin running this as a persistent Processor.
             */
            const daemonOffset = parm.indexOf(DaemonDecider.DAEMON_KEY);

            if (daemonOffset > -1) {
                this.startServer = true;
                if (process.env.ZOWE_DAEMON) {
                    this.mSocket = process.env.ZOWE_DAEMON;
                    if (process.platform === "win32") {
                        this.mSocket = `\\\\.\\pipe\\${this.mSocket}`;
                    }
                }
                Imperative.api.appLogger.debug(`daemon server socket ${this.mSocket}`);
            }
        }
    }

    /**
     * Get whether or not to start the server
     * @private
     * @memberof DaemonDecider
     */
    private get startServer() {
        return this.mStartServer;
    }

    /**
     * Set whether or not to start the server
     * @private
     * @memberof DaemonDecider
     */
    private set startServer(startServer) {
        this.mStartServer = startServer;
    }
}

