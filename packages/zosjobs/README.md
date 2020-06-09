# z/OS Jobs Package

Contains APIs & commands to work with z/OS batch jobs (using z/OSMF Jobs REST endpoints).

# API Examples

**Submit JCL from a z/OS Data Set**

```typescript
import { ISession, Session, Logger, LoggingConfigurer } from "@zowe/imperative";
import { Get, Download } from "@zowe/zosjobs-sdk";

Logger.initLogger(LoggingConfigurer.configureLogger('lib', {name: 'test'}));

const conn: ISession = {
    hostname: "somehost.net",
    port: 443,
    rejectUnauthorized: false,
    user: "ibmuser",
    password: "password",
    type: "basic",
};
const session = new Session(conn);

(async () => {
    const resp = (await SubmitJobs.submitJob(session, "IBMUSER.WORK.JCL(IEFBR14)", {
        encoding: 285
    })).toString();
    console.log(resp);

})();
```
