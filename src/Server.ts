import { GlobalAcceptMimesMiddleware, ServerLoader, ServerSettings } from "@tsed/common";
import * as bodyParser from "body-parser";
import * as compress from "compression";
import * as cookieParser from "cookie-parser";
import * as methodOverride from "method-override";
import * as cors from 'cors';

const rootDir = __dirname;

@ServerSettings({
    rootDir,
    logger: {
        debug: true,
        logRequest: false,
    },
    mount: {
        "/": "${rootDir}/Controllers/**/*.ts"
    },
    componentsScan: [
        /*`${rootDir}/Middleware/!*`,*/
    ],
    acceptMimes: ["application/json"],
})
export class Server extends ServerLoader {
    $beforeInit() {
        // $log.stop()
    }

    /**
     * This method let you configure the express middleware required by your application to works.
     * @returns {Server}
     */
    public $beforeRoutesInit(): void | Promise<any> {
        this
            .use(cors({
                credentials: true,
                origin: '*',
                allowedHeaders: '*',
                exposedHeaders: '*'
            }))
            .use(GlobalAcceptMimesMiddleware)
            .use(cookieParser())
            .use(compress({}))
            .use(methodOverride())
            .use(bodyParser.json())
            .use(bodyParser.urlencoded({
                extended: true
            }));
    }
}
