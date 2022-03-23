const devEnv = {
  DATADOG_ENABLED_DEV: process.env.DATADOG_ENABLED_DEV ?? false,
  ZAPIER_ENABLED_DEV: process.env.DATADOG_ENABLED_DEV ?? false,
  IP3_AMPLIFY_AUTH_APP_ID_DEV: process.env.IP3_AMPLIFY_AUTH_APP_ID_DEV ?? '6gur0ue2pc7l76fokeddgjqf4i',
  IP3_AMPLIFY_AUTH_POOL_ID_DEV: process.env.IP3_AMPLIFY_AUTH_POOL_ID_DEV ?? 'eu-west-1_iOeTWV3Au',
  IP3_AMPLIFY_AUTH_REGION_DEV: process.env.IP3_AMPLIFY_AUTH_REGION_DEV ?? 'eu-west-1',
  IP3_API_KEY_DEV: process.env.IP3_API_KEY_DEV ?? 'MNVE8QO2962C5B8HLSFfq5kfL5FQ932N30Qxi6JD',
  IP3_API_URL_DEV: process.env.IP3_API_URL_DEV ?? 'https://lgnuuzk699.execute-api.eu-west-1.amazonaws.com/dev/',
  IP3_ASSETS_URL_DEV: process.env.IP3_ASSETS_URL_DEV ?? 'https://s3-eu-west-1.amazonaws.com/assets-automation.embeddable.graphics/',
  GET_FUNCTION_URL_DEV: process.env.GET_FUNCTION_URL_DEV ?? 'https://fhqamkpzn2.execute-api.eu-west-1.amazonaws.com/dev/nodegetter',
  RUN_FUNCTION_URL_DEV: process.env.RUN_FUNCTION_URL_DEV ?? 'https://fhqamkpzn2.execute-api.eu-west-1.amazonaws.com/dev/node_runner',
  SAVE_FUNCTION_URL_DEV: process.env.SAVE_FUNCTION_URL_DEV ?? 'https://fhqamkpzn2.execute-api.eu-west-1.amazonaws.com/dev/nodesaver',
  SCHEDULE_FUNCTION_URL_DEV: process.env.SCHEDULE_FUNCTION_URL_DEV ?? 'https://fhqamkpzn2.execute-api.eu-west-1.amazonaws.com/dev/nodescheduler',
};

const prodEnv = {
  DATADOG_ENABLED_PROD: process.env.DATADOG_ENABLED_PROD ?? true,
  ZAPIER_ENABLED_PROD: process.env.DATADOG_ENABLED_PROD ?? true,
  IP3_AMPLIFY_AUTH_APP_ID_PROD: process.env.IP3_AMPLIFY_AUTH_APP_ID_PROD,
  IP3_AMPLIFY_AUTH_POOL_ID_PROD: process.env.IP3_AMPLIFY_AUTH_POOL_ID_PROD,
  IP3_AMPLIFY_AUTH_REGION_PROD: process.env.IP3_AMPLIFY_AUTH_REGION_PROD,
  IP3_API_KEY_PROD: process.env.IP3_API_KEY_PROD,
  IP3_API_URL_PROD: process.env.IP3_API_URL_PROD ?? 'https://api.embeddable.graphics/',
  IP3_ASSETS_URL_PROD: process.env.IP3_ASSETS_URL_PROD ?? 'https://assets.embeddable.graphics/',
  GET_FUNCTION_URL_PROD: process.env.GET_FUNCTION_URL_PROD ?? 'https://fdm86kgzmi.execute-api.eu-west-1.amazonaws.com/dev/nodegetter',
  RUN_FUNCTION_URL_PROD: process.env.RUN_FUNCTION_URL_PROD ?? 'https://fdm86kgzmi.execute-api.eu-west-1.amazonaws.com/dev/node_runner',
  SAVE_FUNCTION_URL_PROD: process.env.SAVE_FUNCTION_URL_PROD ?? 'https://fdm86kgzmi.execute-api.eu-west-1.amazonaws.com/dev/nodesaver',
  SCHEDULE_FUNCTION_URL_PROD: process.env.SCHEDULE_FUNCTION_URL_PROD ?? 'https://fdm86kgzmi.execute-api.eu-west-1.amazonaws.com/dev/nodescheduler',
};

const getEnv = (key) => {
  return process.env.NODE_ENV === 'production' ? prodEnv[key + '_PROD'] : devEnv[key + '_DEV'];
};

const environment = {
  ...devEnv,
  ...prodEnv,
  DATADOG_ENABLED: process.env.DATADOG_ENABLED || getEnv('DATADOG_ENABLED'),
  ZAPIER_ENABLED: process.env.ZAPIER_ENABLED || getEnv('ZAPIER_ENABLED'),
  IP3_AMPLIFY_AUTH_APP_ID: process.env.IP3_AMPLIFY_AUTH_APP_ID || getEnv('IP3_AMPLIFY_AUTH_APP_ID'),
  IP3_AMPLIFY_AUTH_POOL_ID: process.env.IP3_AMPLIFY_AUTH_POOL_ID || getEnv('IP3_AMPLIFY_AUTH_POOL_ID'),
  IP3_AMPLIFY_AUTH_REGION: process.env.IP3_AMPLIFY_AUTH_REGION || getEnv('IP3_AMPLIFY_AUTH_REGION'),
  IP3_API_KEY: process.env.IP3_API_KEY || getEnv('IP3_API_KEY'),
  IP3_API_URL: process.env.IP3_API_URL || getEnv('IP3_API_URL'),
  IP3_ASSETS_URL: process.env.IP3_ASSETS_URL || getEnv('IP3_ASSETS_URL'),
  GET_FUNCTION_URL: process.env.GET_FUNCTION_URL || getEnv('GET_FUNCTION_URL'),
  RUN_FUNCTION_URL: process.env.RUN_FUNCTION_URL || getEnv('RUN_FUNCTION_URL'),
  SAVE_FUNCTION_URL: process.env.SAVE_FUNCTION_URL || getEnv('SAVE_FUNCTION_URL'),
  SCHEDULE_FUNCTION_URL: process.env.SCHEDULE_FUNCTION_URL || getEnv('SCHEDULE_FUNCTION_URL'),
};

export default environment;
