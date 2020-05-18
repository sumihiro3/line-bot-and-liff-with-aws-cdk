#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { LiffWithS3AndCloudFrontStack } from '../lib/liff_with_s3_and_cloud_front-stack';

const app = new cdk.App();
new LiffWithS3AndCloudFrontStack(app, 'LiffWithS3AndCloudFrontStack');
