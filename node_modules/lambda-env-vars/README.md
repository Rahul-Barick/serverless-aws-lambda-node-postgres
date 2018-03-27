# Lambda Environment Variables
> A package for decrypting Lambda environment variables encrypted by AWS KMS

[![Coverage Status](https://coveralls.io/repos/github/aceew/aws-lambda-env-vars/badge.svg?branch=master)](https://coveralls.io/github/aceew/aws-lambda-env-vars?branch=master)
[![Build Status](https://travis-ci.org/aceew/aws-lambda-env-vars.svg?branch=master)](https://travis-ci.org/aceew/aws-lambda-env-vars)

The purpose of this package is the easily decrypt and fetch environment variables in Lambda functions, using KMS for decryption. The package supports getting environment variables that have been encrypted in Lambda using a default service key, however the main purpose is for decrypting variables that were encrypted using a custom KMS key. For more information on Lambda environment variables and encryption keys, see the [AWS Documentation](http://docs.aws.amazon.com/lambda/latest/dg/env_variables.html).

Before implementing it is recommended you read the [FAQs](#faqs) section

## Contents
- [Usage](#usage)
- [FAQs](#faqs)
- [Contributing](#contributing)

## Usage

### AWS config
When using encrypted environment variables you will need to create a KMS key in IAM and give usage permission to the role that your Lambda function has been assigned. You then need to configure your Lambda function to use the new KMS key by default. This can be found in the Lambda function under
`Configuration -> Advanced settings -> KMS key`.

### Add lambda-env-vars to your project
```console
$ npm install --save lambda-env-vars
```
If you're using yarn:
```console
$ yarn add lambda-env-vars
```

### Lambda Handler Example
It's important that the instance of the class is defined outside the handler, in order to utilize global variable caching, to cut down on KMS decryption charges.

ES6 Example:
```javascript
import LambdaEnvVars from 'lambda-env-vars';
const lambdaEnvVars = new LambdaEnvVars();

function handler(event, context, callback) {
  // Get an environment variable encrypted using a custom KMS key.
  lambdaEnvVars.getCustomDecryptedValue('envVarKey')
    .then((decryptedValue) => {
      doSomethingWithDecryptedValue(decryptedValue);
    });

  // Get an environment variable that uses a default service key.
  const simpleKeyVariable = lambdaEnvVars.getDefaultDecryptedValue('simpleEnvVarKey');
  doSomethingWithSimpleVariable(simpleKeyVariable);
}

export { handler };
```

ES5 Example:
```javascript
var LambdaEnvVars = require('lambda-env-vars');
var lambdaEnvVars = new LambdaEnvVars.default();

exports.handler = (event, context, callback) => {
  lambdaEnvVars.getCustomDecryptedValue('testVariable')
    .then(doSomethingWithDecryptedValue);

  const simpleKeyVariable = lambdaEnvVars.getDefaultDecryptedValue('simpleEnvVarKey');
  doSomethingWithSimpleVariable(simpleKeyVariable);
};

```

## API Reference

### Setting default config parameters
The methods `getCustomDecryptedValue` and `getCustomDecryptedValueList` both accept a second parameter object to allow users to specify the location ('s3' or 'lambdaConfig') of the environment variables. These parameters can be defined by default by specifying them when the class is initially instanced. For example:
```javascript
import LambdaEnvVars from 'lambda-env-vars';
const lambdaEnvVars = new LambdaEnvVars({
  location: 's3',
  s3Config: {
    bucketName: 'my-env-var-bucket',
    fileName: 'my-env-var-filename.json',
  },
});
```

The default parameters can be overridden by simple specifying them on function call:
```javascript
const params = { location: 'lambdaConfig' };
lambdaEnvVars.getCustomDecryptedValue('variableName', params)
  .then((variableName) => {
    console.log(variableName);
    // variableName will be fetched from the lambdaConfig
  });
```

### <a name="config-params"></a>Config parameters
The default config parameters object specifies that the source of environment variables should be the 'lambdaConfig', this is where users can define lambda env variables in the AWS console. Here's what that object looks like:
```javascript
{
  location: 'lambdaConfig',
  s3Config: {},
}
```

Optionally the source of environment variables can be a JSON file within an S3 bucket. This is good for situations where your Lambda function config exceeds 4KB and you still need to store more environment variables. Encryption where the Lambda function environment variables are in S3 should be achieved with [SSE-S3](http://docs.aws.amazon.com/AmazonS3/latest/dev/UsingServerSideEncryption.html) or [SSE-KMS](http://docs.aws.amazon.com/AmazonS3/latest/dev/UsingKMSEncryption.html). I'd personally recommend setting up a bucket policy to stop uploads that aren't encrypted at rest, just to be safe. One further thing to consider is your Lambda function's role will need a policy to allow reads to the bucket the environment variable file is stored in. The parameters required when using S3 as the source of the variables should look like the following:
```javascript
{
  location: 's3',
  s3Config: {
    bucketName: 'name-of-bucket',
    fileName: 'filename.json', // Name of the JSON file containing the env vars
  },
}
```

The available attributes of the params object are as follows:

| Name | Type | Default | Info |
| --- | --- | --- | --- |
| location | string | 'lambdaConfig' | Can be 'lambdaConfig' or 's3'. The location the environment variables are stored.
| s3Config | object | {} | Required when location is equal to 's3'. Fields that specify the location of the env var JSON file |
| s3Config.bucketName | string | | The name of the bucket containing the env var file. |
| s3Config.fileName | string | | The file name of the env var JSON file. |


### Decrypt an environment variable that uses a custom KMS key
Uses KMS to decrypt the cipher text stored under the environment variable of the specified key name. Caches the decrypted variable in the global scope so it is only decrypted once per container, cutting down on KMS decryption costs.

```javascript
lambdaEnvVars.getCustomDecryptedValue('envVarKey');
```
Parameters:

| Name | Type | Default | Info |
| --- | --- | --- | --- |
| variableName | string | '' | The key in process.env to which the variable is stored under. |
| configParams | object | [configParams](#config-params) | Optional. Information that allows the package to know where to get the variable from. For more info see the [config params section](#config-params) |

Returns a promise that resolves the decrypted value, or rejects an error if there were issues connecting to KMS or issues with the encrypted payload.

### Decrypt multiple environment variables that use a custom KMS key
Like the single variable, uses KMS to decrypt the cipher text stored under keys in the `process.env` object (Lambda environment variables). Again, the decrypted values are cached in the global scope, so the variables are only encrypted once per Lambda container. Multiple environment variable keys can be specified and they will be returned as keys to an object where the values are decrypted.

```javascript
lambdaEnvVars.getCustomDecryptedValueList(['envVarKey1', 'envVarKey2']);
// returns { envVarKey1: 'Decrypted variable', envVarKey2: 'Decrypted variable' }
```

Parameters:

| Name | Type | Default | Info |
| --- | --- | --- | --- |
| variableNames | Array | [] | Keys in process.env to which encrypted environment variables are stored under. |
| configParams | object | [configParams](#config-params) | Optional. Information that allows the package to know where to get the variables from. For more info see the [config params section](#config-params) |

Returns an object containing the decrypted values where the keys are the items specified in the params `variableNames`.


### Get an environment variable decrypted using a default service key
Returns the variable stored under `process.env` for the specified key. Default service key encrypted variables are decrypted before the Lambda invocation meaning the decrypted value is already available under `process.env`.

```javascript
const value = lambdaEnvVars.getDefaultDecryptedValue('envVarKey');
```
Parameters:

| Name | Type | Default | Info |
| --- | --- | --- | --- |
| variableName | string | '' | The key in process.env to which the variable is stored under. |

Returns the string value of the environment variable. No decryption takes place in code as this is done before Lambda is called.

## <a name="faqs"></a>FAQs

### My Lambda config exceeds 4KB. What do I do?
Lambda imposes a 4KB limit on function config, this is inclusive of environment variables. and by using a few encrypted environment variables it easy to quickly reach this limit. The way this package recommends using environment variables when the Lambda config reaches 4KB is by storing a file in S3 that is encrypted at rest and pulling this down on the first invocation of the Lambda function and caching it for reduced calls to S3. For using environment variables stored in s3, see the [config parameters section](#config-params).

### Why is the aws-sdk a dev dependency?
The package depends on the aws-sdk, however it is not listed as a dependency as it should be installed on your lambda environment by default.

### Doesn't KMS decryption get quite expensive?
Yes, however as it is recommended in AWS's KMS helper code, the decrypted variables are stored in memory so only the first invocation of a Lambda function container incurs a KMS cost. All requests after this point will receive the var stored in memory.


## Contributing
- Start a feature branch from master
- Tests should be written in the test directory for any new features.
- Code should follow the installed style guide of airbnb.
- Tests and linting can be run with `npm test`.
- Once your feature is complete submit a PR to the master branch.
