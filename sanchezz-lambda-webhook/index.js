exports.handler = async (event) => {
    console.log(event.body);
    const body = event.body;
    try {
        console.log(`Deploying for commit ${body.commits[0].id}`);
    }catch (error){
        console.log(`Error while deploying ${error}`);
    }
    return {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
}; 