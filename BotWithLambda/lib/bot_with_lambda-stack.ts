import * as cdk from '@aws-cdk/core'
import {
  Code,
  Function as LambdaFunction,
  LayerVersion,
  Runtime,
  StartingPosition,
} from '@aws-cdk/aws-lambda'
import { LambdaRestApi } from '@aws-cdk/aws-apigateway'
import { Table, AttributeType, StreamViewType } from '@aws-cdk/aws-dynamodb'
import { DynamoEventSource, SqsDlq } from '@aws-cdk/aws-lambda-event-sources'
import { Queue } from '@aws-cdk/aws-sqs'
import * as path from 'path'

export class BotWithLambdaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // Create User table
    const userTableName = 'BotWithLambdaUserTable'
    const userTable = new Table(this, userTableName, {
      tableName: userTableName,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      readCapacity: 1,
      writeCapacity: 1,
      stream: StreamViewType.NEW_IMAGE, // configure DynamoDB Stream
    })
    console.log('Created User Table', userTable.tableName)

    // Lambda Layer
    const layerFunctionName = 'BotWithLambdaLayer'
    const layer = new LayerVersion(this, layerFunctionName, {
      layerVersionName: layerFunctionName,
      compatibleRuntimes: [Runtime.NODEJS_12_X],
      code: Code.fromAsset('dist'),
    })

    // Lambda Function [API]
    const functionName = 'BotWithLambda'
    const apiLambdaFunction = new LambdaFunction(this, functionName, {
      functionName: functionName,
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: Code.fromAsset(path.join(__dirname, '..', 'src')),
      timeout: cdk.Duration.seconds(300),
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
    userTable.grantReadWriteData(apiLambdaFunction)
    // API Gateway
    const apiGwName = 'BotWithLambdaApiGW'
    const api = new LambdaRestApi(this, apiGwName, {
      restApiName: apiGwName,
      handler: apiLambdaFunction,
      proxy: false,
    })
    api.root.addMethod('POST')

    // Lambda Function [DynamoDB Streams]
    const dbStreamFunctionName = 'BotWithLambdaDbStream'
    const dbStreamLambdaFunction = new LambdaFunction(
      this,
      dbStreamFunctionName,
      {
        functionName: dbStreamFunctionName,
        runtime: Runtime.NODEJS_12_X,
        handler: 'db_stream.handler',
        code: Code.fromAsset('src'),
        timeout: cdk.Duration.seconds(300),
        // Environment Values
        environment: {
          REGION: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
          KINTONE_API_URL: process.env.KINTONE_API_URL || '',
          KINTONE_APP_ID: process.env.KINTONE_APP_ID || '',
          KINTONE_API_TOKEN: process.env.KINTONE_API_TOKEN || '',
        },
        layers: [layer],
      }
    )
    // Dead letter queue
    const dlqName = 'BotWithLambdaDLQ'
    const deadLetterQueue = new Queue(this, dlqName, {
      queueName: dlqName,
    })
    // add Event source
    dbStreamLambdaFunction.addEventSource(
      new DynamoEventSource(userTable, {
        startingPosition: StartingPosition.TRIM_HORIZON,
        batchSize: 5,
        bisectBatchOnError: true,
        onFailure: new SqsDlq(deadLetterQueue),
        retryAttempts: 10,
      })
    )
  }
}
