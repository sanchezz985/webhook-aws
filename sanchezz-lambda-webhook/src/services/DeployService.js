const aws = require('../config/ConfigAWS');

const getFunctions = async () => {
    let functions = [];
    let data = {};
    let functionsMap = new Map();
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
            functionsMap.set(fn.FunctionName, fn);
        });
    }
    return functionsMap;
};

module.exports = {
    getFunctions
};