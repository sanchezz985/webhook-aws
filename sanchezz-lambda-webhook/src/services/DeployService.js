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
        fs.writeFile("/tmp/lambda_functions.json", JSON.stringify(functions), err => {
            if(err) return console.log(err);
            console.log("File lambda_functions.json was created successfully")
        });
    }
};

module.exports = {
    getFunctions
};