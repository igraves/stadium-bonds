import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

export interface StarBondStackProps extends cdk.StackProps {
  /** Custom domain name (e.g., starbond.example.com) */
  domainName?: string;
  /** Route 53 hosted zone ID */
  hostedZoneId?: string;
  /** ACM certificate ARN (must be in us-east-1 for CloudFront) */
  certificateArn?: string;
}

export class StarBondStack extends cdk.Stack {
  public readonly distributionUrl: cdk.CfnOutput;
  public readonly apiUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: StarBondStackProps = {}) {
    super(scope, id, props);

    const { domainName, hostedZoneId, certificateArn } = props;

    // ========================================
    // S3 Bucket for Frontend Assets
    // ========================================
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      // Let CloudFormation generate unique bucket names to avoid conflicts
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // S3 Bucket for Data Files (PDFs, Excel files)
    const dataBucket = new s3.Bucket(this, 'DataBucket', {
      // Let CloudFormation generate unique bucket names to avoid conflicts
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // ========================================
    // Lambda Function for API
    // ========================================
    const apiFunction = new lambda.Function(this, 'ApiFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'lambda.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../api/dist/lambda')),
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      environment: {
        NODE_ENV: 'production',
        DATA_BUCKET: dataBucket.bucketName,
      },
      description: 'STAR Bond Financing API - Fastify on Lambda',
    });

    // Grant Lambda read access to data bucket
    dataBucket.grantRead(apiFunction);

    // ========================================
    // API Gateway
    // ========================================
    const api = new apigateway.RestApi(this, 'StarBondApi', {
      restApiName: 'STAR Bond API',
      description: 'API for STAR Bond Financing Dashboard',
      deployOptions: {
        stageName: 'api',
        throttlingBurstLimit: 100,
        throttlingRateLimit: 50,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // Proxy all requests to Lambda
    const lambdaIntegration = new apigateway.LambdaIntegration(apiFunction, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    // Add proxy resource for all API paths
    const proxyResource = api.root.addResource('{proxy+}');
    proxyResource.addMethod('ANY', lambdaIntegration);
    api.root.addMethod('ANY', lambdaIntegration);

    // ========================================
    // CloudFront Distribution
    // ========================================

    // Origin Access Identity for S3
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: 'OAI for STAR Bond website',
    });
    websiteBucket.grantRead(originAccessIdentity);
    dataBucket.grantRead(originAccessIdentity);

    // Certificate (if provided)
    let certificate: acm.ICertificate | undefined;
    if (certificateArn) {
      certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', certificateArn);
    }

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, { originAccessIdentity }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
      },
      additionalBehaviors: {
        // API requests go to API Gateway
        // CloudFront strips /api prefix and routes to API Gateway stage /api
        '/api/*': {
          origin: new origins.HttpOrigin(
            `${api.restApiId}.execute-api.${this.region}.amazonaws.com`
          ),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        },
        // Data files from data bucket
        '/data/*': {
          origin: new origins.S3Origin(dataBucket, { originAccessIdentity }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        },
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
      domainNames: domainName ? [domainName] : undefined,
      certificate,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });

    // ========================================
    // Route 53 DNS Record
    // ========================================
    if (domainName && hostedZoneId) {
      const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
        hostedZoneId,
        zoneName: domainName.split('.').slice(-2).join('.'), // Extract base domain
      });

      new route53.ARecord(this, 'AliasRecord', {
        zone: hostedZone,
        recordName: domainName,
        target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      });

      new route53.AaaaRecord(this, 'AliasRecordIPv6', {
        zone: hostedZone,
        recordName: domainName,
        target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      });
    }

    // ========================================
    // S3 Deployments
    // ========================================

    // Deploy frontend assets
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../web/dist'))],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
      memoryLimit: 512,
    });

    // Deploy data files
    new s3deploy.BucketDeployment(this, 'DeployData', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../data'))],
      destinationBucket: dataBucket,
      destinationKeyPrefix: '',
    });

    // ========================================
    // Outputs
    // ========================================
    this.distributionUrl = new cdk.CfnOutput(this, 'DistributionUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront distribution URL',
    });

    this.apiUrl = new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });

    if (domainName) {
      new cdk.CfnOutput(this, 'CustomDomainUrl', {
        value: `https://${domainName}`,
        description: 'Custom domain URL',
      });
    }

    new cdk.CfnOutput(this, 'WebsiteBucketName', {
      value: websiteBucket.bucketName,
      description: 'S3 bucket for website assets',
    });

    new cdk.CfnOutput(this, 'DataBucketName', {
      value: dataBucket.bucketName,
      description: 'S3 bucket for data files',
    });
  }
}
