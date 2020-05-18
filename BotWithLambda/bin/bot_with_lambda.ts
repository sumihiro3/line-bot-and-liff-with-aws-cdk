#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { BotWithLambdaStack } from '../lib/bot_with_lambda-stack';
import { prepareLambdaLayerModules } from '../lib/prepareLambdaLayerModules'

console.log('ACCESS_TOKEN', process.env.ACCESS_TOKEN)
console.log('CHANNEL_SECRET', process.env.CHANNEL_SECRET)

prepareLambdaLayerModules();

const app = new cdk.App();
new BotWithLambdaStack(app, 'BotWithLambdaStack');
