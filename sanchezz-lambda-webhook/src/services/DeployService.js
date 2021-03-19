const aws = require('../config/ConfigAWS');
let fs = require("fs");

const getFunctions = async () => {
    let functions = [];
    let data = {};
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
        console.log(JSON.stringify(JSON.stringify(functions)));
        fs.createWriteStream("lambda_functions.json", "dfghjklñ");
        console.log("File lambda_functions.json was created successfully")
    }
};

module.exports = {
    getFunctions
};