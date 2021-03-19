exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    try {
        console.log(`=== Deploying for commit ${body.commits[0].id} ===`);
        const commitMessage = body.commits[0].message.slit(";");
        const functions = commitMessage[0];
        const environments = commitMessage[1];
        const message = commitMessage[2];
        console.log("Deploying info: ");
        console.log(`Functions to deploy: ${functions}\n Environments: ${environments} \n Message: ${message}`);        

    }catch (error){
        console.log(`Error while deploying ${error}`);
    }
    return {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    }; 
};