console.log("ab\\c\"def".replace(/(["\\])/g, `\\$1`));
// const { Headers, ProfileInfo } = require("@zowe/imperative");
// const { IssueTso, List, ZosmfRestClient } = require("./packages/cli");

// (async () => {
//     // Load connection info from default z/OSMF profile
//     const profInfo = new ProfileInfo("zowe");
//     await profInfo.readProfilesFromDisk();
//     const zosmfProfAttrs = profInfo.getDefaultProfile("zosmf");
//     const zosmfMergedArgs = profInfo.mergeArgsForProfile(zosmfProfAttrs, { getSecureVals: true });
//     const session = ProfileInfo.createSession(zosmfMergedArgs.knownArgs);

//     const dataset = "JOHTI04.COPYBOOK.UNTERSED";
//     const options = {};
//     const response = await List.allMembers(session, dataset, options);
//     console.dir(response.apiResponse);
// })().catch((err) => {
//     console.error(err);
//     process.exit(1);
// });
