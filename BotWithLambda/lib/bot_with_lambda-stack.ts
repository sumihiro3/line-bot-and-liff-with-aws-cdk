import * as cdk from '@aws-cdk/core'
import {
  Code,
  Function as LambdaFunction,
  LayerVersion,
  Runtime,
} from '@aws-cdk/aws-lambda'
import { LambdaRestApi } from '@aws-cdk/aws-apigateway'
import { Table, AttributeType } from '@aws-cdk/aws-dynamodb'
import * as path from 'path'

export class BotWithLambdaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // Create User table
    const userTable = new Table(this, 'BotWithLambdaUserTable', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      readCapacity: 1,
      writeCapacity: 1,
    })
    console.log('Created User Table', userTable.tableName)

    // Lambda Layer
    const layer = new LayerVersion(this, 'BotWithLambdaLayer', {
      compatibleRuntimes: [Runtime.NODEJS_12_X],
      code: Code.fromAsset('dist'),
    })

    // Lambda Function
    const lambdaFunction = new LambdaFunction(this, 'BotWithLambda', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: Code.fromAsset(path.join(__dirname, '..', 'src')),
      // Environment Values
      environment: {
        REGION: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
        ACCESS_TOKEN: process.env.ACCESS_TOKEN || '',
        CHANNEL_SECRET: process.env.CHANNEL_SECRET || '',
        USER_TABLE_NAME: userTable.tableName,
      },
      layers: [layer],
    })
    // Grant Read/Write to User table
    userTable.grantReadWriteData(lambdaFunction)

    // API Gateway
    const api = new LambdaRestApi(this, 'BotWithLambdaAPI', {
      handler: lambdaFunction,
      restApiName: 'botWithLambda',
      proxy: false,
    })
    api.root.addMethod('POST')
  }
}
