#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { StarBondStack } from '../lib/star-bond-stack';

const app = new cdk.App();

// Get configuration from context or environment
const domainName = app.node.tryGetContext('domainName') || process.env.DOMAIN_NAME;
const hostedZoneId = app.node.tryGetContext('hostedZoneId') || process.env.HOSTED_ZONE_ID;
const certificateArn = app.node.tryGetContext('certificateArn') || process.env.CERTIFICATE_ARN;

new StarBondStack(app, 'StarBondStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  domainName,
  hostedZoneId,
  certificateArn,
  description: 'STAR Bond Financing Dashboard - CloudFront + S3 + Lambda + API Gateway',
});

app.synth();
