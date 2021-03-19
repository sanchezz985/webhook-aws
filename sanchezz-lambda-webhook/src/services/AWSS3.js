/**
 * Functions to manage AWS S3
 */

const AWS = require("aws-sdk");

module.exports = S3;


function S3() {
    this.awsS3 = new AWS.S3({
        apiVersion: process.env.S3VERSION,
        accessKeyId: process.env.ACCESSKEYAWS,
        secretAccessKey: process.env.SECRETKEYAWS,
        region: process.env.REGION
    });
};

/**
 * Upload files into Amazon S3 Bucket
 * @public
 * @param {Object} params Object with file information
 * {
 *      bucket: 'my-bucket-name',
 *      nameToSave: 'name-to-save-in-bucket',
 *      content: <Buffer 25 50 6f 62 ... >,
 *      contentType: 'application/pdf'
 * }
 */
S3.prototype.uploadFile = function uploadFile(params) 
{
    return new Promise((resolve, reject) => {
        this.awsS3.upload({
            Bucket: params.bucket,
            Key: params.key,
            Body: params.body
        })
        .promise()
        .then(data => {
            resolve(data.Location);
        })
        .catch(reject);
    });
};

S3.prototype.getObject = function getObject(params)
{
    return new Promise((resolve, reject) => {
        this.awsS3.getObject({
            Bucket: params.bucket,
            Key: params.key
        })
        .promise()
        .then(data => {resolve(data)})
        .catch(reject);
    });
};

S3.prototype.deleteObject = function deleteObject(params)
{
    return new Promise((resolve, reject) => {
        this.awsS3.deleteObject({
            Bucket: params.bucket,
            Key: params.key
        })
        .promise()
        .then(data => {resolve(data)})
        .catch(reject);
    });
};