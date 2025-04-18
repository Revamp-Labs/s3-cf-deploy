import * as cdk from "aws-cdk-lib/core";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import {
  getDNSZone,
  getCertificate,
  setDNSRecord,
  getSubdomain,
  getDomain,
} from "./utils";

const env = {
  // Stack must be in us-east-1, because the ACM certificate for a
  // global CloudFront distribution must be requested in us-east-1.
  region: "us-east-1",
  account: process.env.CDK_DEFAULT_ACCOUNT ?? "mock",
};

export class StaticPageStack extends cdk.Stack {
  constructor(
    scope: cdk.App,
    id: string,
    {
      stackName,
      folder,
      fullDomain,
      originPath,
    }: {
      stackName: string;
      folder: string;
      fullDomain: string;
      originPath: string;
    },
  ) {
    super(scope, id, { stackName, env });

    const subdomain = getSubdomain(fullDomain);
    const domain = getDomain(fullDomain);

    const zone = getDNSZone(this, domain);
    const certificate = getCertificate(this, fullDomain, zone);

    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error.html",
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        ignorePublicAcls: false,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
      }),
    });

    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "Distribution",
      {
        originConfigs: [
          {
            customOriginSource: {
              domainName: websiteBucket.bucketWebsiteDomainName,
              originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
              originPath: originPath,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
        viewerCertificate: certificate,
        comment: `CDN for static page on ${fullDomain}`,
        priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
      },
    );

    setDNSRecord(this, subdomain, zone, distribution);

    new s3deploy.BucketDeployment(this, "DeployWithInvalidation", {
      sources: [s3deploy.Source.asset(folder)],
      destinationBucket: websiteBucket,
      destinationKeyPrefix: originPath,
      distribution,
      distributionPaths: ["/*"],
    });
  }
}
