const DeployService = require('../services/DeployService');

exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    console.log(JSON.stringify(body));
    try {
        console.log(`=== Deploying for commit ${body.commits[0].id} ===`);
        if(!body.commits[0].message)
            throw new Error("Commit without correct template");

        const commitMessage = body.commits[0].message.trim().split(";");
        const functions = getLineValue(commitMessage[0]);
        const environments = getLineValue(commitMessage[1]);
        const message = getLineValue(commitMessage[2]);

        console.log(`\n Deploying info:  \n Functions to deploy: ${functions}\n Environments: ${environments} \n Message: ${message}`);

        let functionsMap = await DeployService.getFunctions();
        DeployService.validateFunctions(functions, functionsMap);
        await DeployService.startDeploy(functions, functionsMap);

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