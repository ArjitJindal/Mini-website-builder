import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as iam from "aws-cdk-lib/aws-iam";

export class WebsiteStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      bucketName: `${id}-website-bucket`.toLowerCase(),
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );

    websiteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [websiteBucket.arnForObjects("*")],
        principals: [
          new iam.CanonicalUserPrincipal(
            originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );

    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, {
          originAccessIdentity,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: "index.html",
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ],
    });

    // Create IAM role for GitHub Actions
    const githubActionRole = new iam.Role(this, "GitHubActionRole", {
      assumedBy: new iam.WebIdentityPrincipal(
        "token.actions.githubusercontent.com",
        {
          StringEquals: {
            "token.actions.githubusercontent.com:sub":
              "repo:your-github-username/your-repo-name:ref:refs/heads/main",
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          },
        }
      ),
      description: "Role for GitHub Actions deployment",
    });

    // Add permissions for S3 and CloudFront
    githubActionRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
        resources: [websiteBucket.bucketArn, `${websiteBucket.bucketArn}/*`],
      })
    );

    githubActionRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["cloudfront:CreateInvalidation"],
        resources: [
          `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
        ],
      })
    );

    // Output the role ARN
    new cdk.CfnOutput(this, "GitHubActionRoleArn", {
      value: githubActionRole.roleArn,
      description: "ARN of role for GitHub Actions",
    });

    // Output the distribution URL and bucket name
    new cdk.CfnOutput(this, "DistributionId", {
      value: distribution.distributionId,
    });

    new cdk.CfnOutput(this, "DistributionDomain", {
      value: distribution.distributionDomainName,
    });

    new cdk.CfnOutput(this, "BucketName", {
      value: websiteBucket.bucketName,
    });
  }
}
