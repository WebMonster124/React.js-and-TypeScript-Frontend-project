import env from './env.js';

export default {
  Auth: {
    // REQUIRED - Amazon Cognito Region
    region: env.IP3_AMPLIFY_AUTH_REGION,
    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: env.IP3_AMPLIFY_AUTH_POOL_ID,
    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: env.IP3_AMPLIFY_AUTH_APP_ID,
  },
};
