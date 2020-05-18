#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { BotWithLambdaStack } from '../lib/bot_with_lambda-stack';

const app = new cdk.App();
new BotWithLambdaStack(app, 'BotWithLambdaStack');
