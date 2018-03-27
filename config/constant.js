import LambdaEnvVars from "lambda-env-vars";
const lambdaEnvVars = new LambdaEnvVars();

const DatabaseConfig = {
  dbName: lambdaEnvVars.getDefaultDecryptedValue("dbName"),
  dbUser: lambdaEnvVars.getDefaultDecryptedValue("dbUser"),
  dbPass: lambdaEnvVars.getDefaultDecryptedValue("dbPass"),
  dbHost: lambdaEnvVars.getDefaultDecryptedValue("dbHost")
};

export default DatabaseConfig;
