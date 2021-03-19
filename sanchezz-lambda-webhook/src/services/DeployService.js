const aws = require('../config/ConfigAWS');

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

const startDeploy = async (functions, fnMap) => {
    functions.split(",").forEach(fun => {
        
    });
};

module.exports = {
    getFunctions,
    validateFunctions
};