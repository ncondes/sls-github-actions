const { CognitoJwtVerifier } = require("aws-jwt-verify");
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID;

const jwtVerifier = CognitoJwtVerifier.create({
  clientId: COGNITO_CLIENT_ID,
  userPoolId: COGNITO_USER_POOL_ID,
  tokenUse: "id",
});

const generatePolicy = (principalId, effect, resource) => {
  const authResponse = { principalId };

  if (effect && resource) {
    authResponse.policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    };
  }

  authResponse.context = {
    foo: "bar",
  };

  return authResponse;
};

exports.handler = async (event, context, callback) => {
  const token = event.authorizationToken;

  try {
    const payload = await jwtVerifier.verify(token);

    console.log(JSON.stringify(payload));

    callback(null, generatePolicy("user", "Allow", event.methodArn));
  } catch (error) {
    callback("Error: Invalid token");
  }
};
