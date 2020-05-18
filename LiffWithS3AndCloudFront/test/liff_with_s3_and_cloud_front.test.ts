import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as LiffWithS3AndCloudFront from '../lib/liff_with_s3_and_cloud_front-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new LiffWithS3AndCloudFront.LiffWithS3AndCloudFrontStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
