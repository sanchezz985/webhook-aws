const aws = require('../config/ConfigAWS');
const axios = require('axios');

const getFunctions = async () => {
    let functions = [];
    let data = {};
    let fnMap = new Map();
    const lambda = new aws.AWSLambda();
    console.log("=== LISTING FUNCTIONS ===")
    do {
        try {
            data = await lambda.listFunctions(data.NextMarker);
            functions = [...functions, ...data.Functions];
        } catch (e) {
            throw e;
        }
    } while (data.NextMarker);
    if(functions.length > 0) {
        functions.forEach(fn => {
            fnMap.set(fn.FunctionName, fn);
        });
    }
    return fnMap;
};

const validateFunctions = (functions, fnMap) => {
    functions.split(",").forEach(fn => {
        if(fnMap.get(fn.trim()) === undefined)
            throw new Error(`Function ${fn} doesn't exist`);
    });
};

const startDeploy = async (repoInfo, functions, fnMap) => {
    const branch = getBranch(repoInfo.ref); 
    console.log(branch);
    const url = `${repoInfo.repository.url}/archive/${repoInfo.ref}.zip`
    console.log(`=== DOWNLOADING CODE FROM ${url} ====`);
    let responseFile = await axios({ url: url, method: "GET", responseType: "stream"});
    let fileContents = await pipeLocalFile(responseFile.data, `${repoInfo.repository.name}-${branch}`);
    if(!fileContents)
        throw new Error(`Coundn't get code from ${url}`);
    console.log("Zip created successfully");

};

const getBranch = (ref) => {
    return ref.split("/")[ref.split("/").length-1];
};

const pipeLocalFile = (streamFile, name) => {
    const TMP_FILE_PATH = `${process.env.TMP_DIRECTORY}${name}.zip`;
    const tmpFile = fs.createWriteStream(TMP_FILE_PATH);
    const pipeline = streamFile.pipe(tmpFile);
    return new Promise((resolve, reject) => {
        pipeline.on("close", () => {
            let fileContent = fs.readFileSync(TMP_FILE_PATH);
            resolve(fileContent);
        });
        pipeline.on("error", reject);
    });
};

module.exports = {
    getFunctions,
    validateFunctions,
    startDeploy
};