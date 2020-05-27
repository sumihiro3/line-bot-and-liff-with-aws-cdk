import * as cdk from '@aws-cdk/core'

import * as s3 from '@aws-cdk/aws-s3'
import * as iam from '@aws-cdk/aws-iam'
import * as s3Deploy from '@aws-cdk/aws-s3-deployment'
import * as cloudfront from '@aws-cdk/aws-cloudfront'

export class LiffWithS3AndCloudFrontStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // The code that defines your stack goes here
    // SPA をデプロイする先のS3バケット
    const spaBucketName = `spa-bucket-liff-with-s3-cloudfront`
    const spaBucket = new s3.Bucket(this, spaBucketName, {
      bucketName: spaBucketName,
      websiteErrorDocument: 'index.html',
      websiteIndexDocument: 'index.html',
    })

    // CloudFrontからwebsiteBucketにアクセスする際のOriginAccessIdentity
    const websiteOAI = new cloudfront.OriginAccessIdentity(
      this,
      `CFIdentity-${this.stackName}`
    )

    // 作ったOAI に `s3:GetObject` を許可
    const spaBucketPolicyStatement = new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      effect: iam.Effect.ALLOW,
      principals: [websiteOAI.grantPrincipal],
      resources: [`${spaBucket.bucketArn}/*`],
    })
    spaBucket.addToResourcePolicy(spaBucketPolicyStatement)

    // CloudFront のDistribution を作成
    const websiteDistribution = new cloudfront.CloudFrontWebDistribution(
      this,
      `CFDistribution-${this.stackName}`,
      {
        errorConfigurations: [
          {
            errorCachingMinTtl: 300,
            errorCode: 403,
            responseCode: 200,
            responsePagePath: '/index.html',
          },
          {
            errorCachingMinTtl: 300,
            errorCode: 404,
            responseCode: 200,
            responsePagePath: '/index.html',
          },
        ],
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: spaBucket,
              originAccessIdentity: websiteOAI,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
              },
            ],
          },
        ],
        priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
      }
    )

    // ./spa/dist にあるビルド結果をS3 Bucket にデプロイする
    new s3Deploy.BucketDeployment(this, `DeploySpa-${this.stackName}`, {
      sources: [s3Deploy.Source.asset('./spa/dist')],
      destinationBucket: spaBucket,
      distribution: websiteDistribution,
      distributionPaths: ['/*'],
    })

    // CloudFrontのドメインを出力しておく
    new cdk.CfnOutput(this, 'CFTopURL', {
      value: `https://${websiteDistribution.domainName}/`,
    })
  }
}
