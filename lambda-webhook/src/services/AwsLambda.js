/**
 * Functions to manage AWS Lambdas
 */
const AWS = require("aws-sdk");

module.exports = AWSLambda;

/**
 * Build a new Lambda object
 */
function AWSLambda() {
    this.lambda = new AWS.Lambda({
        apiVersion: process.env.LAMBDAVERSION,
        accessKeyId: process.env.ACCESSKEYAWS,
        secretAccessKey: process.env.SECRETKEYAWS,
        region: process.env.REGION
    });
};

/**
 * Returns a list of Lambda functions. Lambda returns up to 50 functions per call.
 * See documentation for listFunctions method in https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lambda.html#listFunctions-property
 * @public
 * @param {String} nextMarker - Specify the pagination token that's returned by a previous request to retrieve the next page of results.
 */
AWSLambda.prototype.listFunctions = function listFunctions(nextMarker)
{
    let params = {Marker : nextMarker ? nextMarker : null};
    return new Promise((resolve, reject) => {
        this.lambda.listFunctions(params)
        .promise()
        .then(data => {resolve(data)})
        .catch(reject);
    });
}

/**
 * Creates a new Lambda function
 * See documentation for createFunction method in https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lambda.html#createFunction-property 
 * @public
 * @param {Object} params - Configuration params for create a new Lambda
 */
AWSLambda.prototype.createFunction = function createFunction(params)
{
    return new Promise((resolve, reject) => {
        this.lambda.createFunction(params)
        .promise()
        .then(data => {resolve(data)})
        .catch(reject);
    });    
};

/**
 * Updates a lambda configuration
 * See documentation for updateFunctionConfiguration method in https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lambda.html#updateFunctionConfiguration-property
 * @public
 * @param {Object} params 
 */
AWSLambda.prototype.updateFunctionConfiguration = function updateFunctionConfiguration(params)
{
    return new Promise((resolve, reject) => {
        this.lambda.updateFunctionConfiguration(params)
        .promise()
        .then(data => {resolve(data)})
        .catch(reject);
    });
};

/**
 * Lists AWS Lambda layers and shows information about the latest version of each.
 * See documentation for listLayer method in https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lambda.html#listLayers-property
 * @public
 * @param {Object} params 
 */
AWSLambda.prototype.listLayers = function listLayers(params)
{
    return new Promise((resolve, reject) => {
        this.lambda.listLayers(params ? params : {})
        .promise()
        .then(data => {resolve(data)})
        .catch(reject);
    });
}

/**
 * Returns information about the specified function
 * See documentation for getFunction method in https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lambda.html#getFunction-property
 * @public
 * @param {String} functionName - can be function name, function ARN or partial ARN
 */
AWSLambda.prototype.getFunction = function getFunction(functionName)
{
    return new Promise((resolve, reject) => {
        this.lambda.getFunction({FunctionName: functionName})
        .promise()
        .then(data => {resolve(data)})
        .catch(reject);
    });
}

AWSLambda.prototype.updateFunctionCode = function updateFunctionCode(params)
{
    return new Promise((resolve, reject) => {
        this.lambda.updateFunctionCode({
            FunctionName: params.name,
            S3Bucket: params.bucket,
            S3Key: params.key,
        })
        .promise()
        .then(data => {resolve(data)})
        .catch(reject);
    });
}