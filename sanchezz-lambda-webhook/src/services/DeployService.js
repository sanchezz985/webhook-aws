const aws = require('../config/ConfigAWS');
const axios = require('axios');
const fs = require('fs');
const AdmZip = require('adm-zip');

const getFunctions = async () => {
    let functions = [];
    let data = {};
    let fnMap = new Map();
    const lambda = new aws.AWSLambda();
    console.log("=== LISTING FUNCTIONS ===");
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
    const url = `${repoInfo.repository.url}/archive/${repoInfo.ref}.zip`;
    console.log(`=== DOWNLOADING CODE FROM ${url} ====`);
    
    const branch = getBranch(repoInfo.ref);
    const responseFile = await axios({ url: url, method: "GET", responseType: "stream"});
    const fileContents = await pipeLocalFile(responseFile.data, `${repoInfo.repository.name}-${branch}`);
    
    if(!fileContents)
        throw new Error(`Coundn't get code from ${url}`);
    
    await unzip(repoInfo, branch);

    const arrayFunctions = functions.split(",");
    for (let i in arrayFunctions) {
        const fn = arrayFunctions[i].trim();
        await prepareLambdaCode(repoInfo, branch, fn);
        let updatedLambda = await updateFunction(fn);
        if(!updatedLambda)
            throw new Error(`Coundn't update function ${fn}`);
        console.log(`Function ${fn} was updated successfully`);
    }

    console.log(`=== DEPLOYING COMPLETE ====`);
};

const updateFunction = async(fn) => {
    console.log(`=== UPDATING FUNCTION ${fn} ===`);
    const lambda = new aws.AWSLambda();
    let updatedLambda = await lambda.updateFunctionCode({
        name: fn,
        bucket: process.env.BUCKET,
        key: `${fn}.zip`,
    });
    return updatedLambda;
};

const prepareLambdaCode = async (repoInfo, branch, fnName) => {
    const lambdaZip = new AdmZip();
    const baseDir = `${process.env.TMP_DIRECTORY}${repoInfo.repository.name}-${branch}`;
    
    // validate the existence of correct directories
    try {
        fs.readdirSync(`${baseDir}/${fnName}/src`);
        fs.readFileSync(`${baseDir}/${fnName}/package.json`);
    }catch (err) {
        throw new Error(`Incorrect file structure for function ${fnName}`);
    }

    try{
        lambdaZip.addLocalFolder(`${baseDir}/${fnName}/src`, "/src");
        lambdaZip.addLocalFile(`${baseDir}/${fnName}/package.json`);
        lambdaZip.writeZip(`${process.env.TMP_DIRECTORY}/${fnName}.zip`);
    }catch (err) {
        throw new Error(`Error while zipping code for function ${fnName}`);
    }

    const lambdaContent = fs.readFileSync(`${process.env.TMP_DIRECTORY}/${fnName}.zip`);
    return await uploadFile(lambdaContent, fnName);

};

const uploadFile = async (content, name) => {
    console.log(`=== UPLOADING CODE TO S3 ===`);
    let s3Directory = null;
    const s3 = new aws.AWSS3();
    const params = {
        bucket: process.env.BUCKET,
        key: `${name}.zip`,
        body: content
    };
    s3Directory = await s3.uploadFile(params);
    if(s3Directory)
        console.log(`=== CODE UPLOADED SUCCESSFULLY IN ${s3Directory}`);
    return s3Directory;
};

const unzip = async (repoInfo, branch) => {
    console.log(`=== UNZIPPING ===`);
    try{
        let repoZip = new AdmZip(`${process.env.TMP_DIRECTORY}${repoInfo.repository.name}-${branch}.zip`);
        repoZip.extractAllTo(`${process.env.TMP_DIRECTORY}`, true);
    }catch (err){
        throw new Error(`Problem while unzipping ::: ${err}`);
    }
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