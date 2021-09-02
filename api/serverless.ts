import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  service: "opensea-analytics-test",
  frameworkVersion: "2",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
  },
  plugins: ["serverless-webpack"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    timeout: 30,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      ETHERSCAN_API_KEY: "CIY7WI1KVXEZEFU666865NST2VGFJCQBGY",
      POLYGONSCAN_API_KEY: "W7HFXH62BZBGB45SJE7J9211EUWGZU7DCF",
    },
    lambdaHashingVersion: "20201221",
  },
  functions: {
    analytics: {
      handler: "functions/analytics.handler",
      role: "LambdaRole",
      events: [
        {
          http: {
            method: "get",
            path: "analytics",
          },
        },
      ],
    },
  },
  resources: {
    Resources: {
      LambdaRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          AssumeRolePolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: {
                  Service: ["lambda.amazonaws.com"],
                },
                Action: "sts:AssumeRole",
              },
            ],
          },
          ManagedPolicyArns: ["arn:aws:iam::aws:policy/AdministratorAccess"],
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
