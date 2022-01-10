const DeployService = require('../services/DeployService');

exports.handler_service = async (event) => {
    const body = JSON.parse(event.body);
    //console.log(JSON.stringify(body));
    try {
        console.log(`=== Deploying for commit ${body.head_commit.id} ===`);
        if(!body.head_commit.message)
            throw new Error("Commit without correct template");

        const commitMessage = body.head_commit.message.trim().split(";");
        console.log(commitMessage[0]);
        console.log(commitMessage[1]);
        console.log(commitMessage[2]);
        const functions = getLineValue(commitMessage[0]);
        const environments = getLineValue(commitMessage[1]);
        const message = getLineValue(commitMessage[2]);

        console.log(`\n Deploying info:  \n Functions to deploy: ${functions}\n Environments: ${environments} \n Message: ${message}`);

        let functionsMap = await DeployService.getFunctions();
        DeployService.validateFunctions(functions, functionsMap);
        await DeployService.startDeploy(body, functions, functionsMap);

    }catch (error){
        console.log(`Error while deploying ${error}`);
    }

    return {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    }; 
};

const getLineValue = (line) => {
    return !line ? "" : line.split(":")[1];
}