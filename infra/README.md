# STAR Bond Dashboard - AWS Infrastructure

This CDK project deploys the STAR Bond Financing Dashboard to AWS.

## Architecture

```
                    ┌─────────────────────────────────────────────────────────────┐
                    │                      CloudFront                              │
                    │                    Distribution                              │
                    └───────────────────────┬─────────────────────────────────────┘
                                            │
              ┌─────────────────────────────┼─────────────────────────────────────┐
              │                             │                                      │
              ▼                             ▼                                      ▼
    ┌─────────────────┐          ┌─────────────────┐               ┌─────────────────┐
    │   S3 Bucket     │          │   API Gateway   │               │   S3 Bucket     │
    │   (Frontend)    │          │     + Lambda    │               │   (Data Files)  │
    │   /index.html   │          │     /api/*      │               │   /data/*       │
    └─────────────────┘          └─────────────────┘               └─────────────────┘
```

## Resources Created

- **S3 Buckets**:
  - Website bucket: Hosts the React frontend build
  - Data bucket: Hosts PDF/Excel data files for download

- **CloudFront Distribution**:
  - Serves frontend from S3
  - Routes `/api/*` requests to API Gateway
  - Routes `/data/*` requests to data S3 bucket
  - Custom domain + SSL (optional)

- **Lambda Function**:
  - Fastify server bundled with esbuild
  - Node.js 20 runtime

- **API Gateway**:
  - REST API fronting the Lambda
  - CORS enabled

- **Route 53** (optional):
  - A/AAAA records pointing to CloudFront

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. Node.js 18+ installed
3. CDK CLI installed: `npm install -g aws-cdk`
4. (Optional) A Route 53 hosted zone for your domain
5. (Optional) An ACM certificate in `us-east-1` for your domain

## Configuration

### Without Custom Domain

```bash
npm run cdk:deploy
```

### With Custom Domain

Set context values or environment variables:

```bash
# Using context
cdk deploy \
  -c domainName=starbond.example.com \
  -c hostedZoneId=Z1234567890ABC \
  -c certificateArn=arn:aws:acm:us-east-1:123456789:certificate/abc-123

# Or using environment variables
export DOMAIN_NAME=starbond.example.com
export HOSTED_ZONE_ID=Z1234567890ABC
export CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789:certificate/abc-123
npm run cdk:deploy
```

## Deployment Commands

From the repository root:

```bash
# Install all dependencies
npm install

# Build everything and deploy
npm run cdk:deploy

# Just synthesize CloudFormation (no deploy)
npm run cdk:synth

# Show differences
npm run cdk:diff

# Destroy all resources
npm run cdk:destroy
```

## Outputs

After deployment, CDK will output:

- `DistributionUrl`: CloudFront distribution URL
- `ApiUrl`: API Gateway URL (direct)
- `CustomDomainUrl`: Your custom domain (if configured)
- `WebsiteBucketName`: S3 bucket for frontend
- `DataBucketName`: S3 bucket for data files

## Notes

- The ACM certificate **must** be in `us-east-1` for CloudFront to use it
- First deployment may take 10-15 minutes (CloudFront distribution creation)
- Data bucket has `RETAIN` removal policy to preserve data files
- Website bucket auto-deletes on stack destruction

## Updating Data Files

To update the data files (PDFs, Excel) without redeploying:

```bash
aws s3 sync ./data s3://<data-bucket-name>/ --delete
```

## Cost Estimate

- CloudFront: ~$0.085/10,000 requests + data transfer
- Lambda: First 1M requests free, then ~$0.20/1M
- API Gateway: ~$3.50/1M requests
- S3: ~$0.023/GB/month
- Route 53: $0.50/hosted zone/month + $0.40/1M queries

For low-to-moderate traffic, expect ~$1-5/month.
