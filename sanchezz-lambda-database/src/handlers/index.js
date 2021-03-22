exports.handler = async (event) => {
    // comment in qa
    return {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
};