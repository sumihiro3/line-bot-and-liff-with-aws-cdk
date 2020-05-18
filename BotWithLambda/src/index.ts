import * as Lambda from 'aws-lambda'
import * as aws from 'aws-sdk'
import * as Line from '@line/bot-sdk'
import * as Types from '@line/bot-sdk/lib/types'

const accessToken = process.env.ACCESS_TOKEN || ''
const channelSecret = process.env.CHANNEL_SECRET || ''

const config: Line.ClientConfig = {
  channelAccessToken: accessToken,
  channelSecret: channelSecret,
}
const client = new Line.Client(config)
const dynamoClient: aws.DynamoDB.DocumentClient = new aws.DynamoDB.DocumentClient(
  {
    region: process.env.REGION,
  }
)

async function putUserRecord(
  event: Line.WebhookEvent,
  active: boolean
): Promise<any> {
  const param: aws.DynamoDB.DocumentClient.PutItemInput = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    TableName: process.env.USER_TABLE_NAME!,
    Item: {
      id: event.source.userId,
      timestamp: event.timestamp,
      active: active,
    },
  }
  console.log('PutItemInput', param)
  let res = false
  try {
    const result = await dynamoClient.put(param).promise()
    console.log('Put Result', result)
    res = true
  } catch (e) {
    console.log(e)
  }
  return res
}

async function eventHandler(event: Line.WebhookEvent): Promise<any> {
  if (event.type === 'follow') {
    await putUserRecord(event, true)
    const message: Types.Message = {
      type: 'text',
      text: 'お友だち追加ありがとうございます！！！',
    }
    return client.replyMessage(event.replyToken, message)
  } else if (event.type === 'unfollow') {
    await putUserRecord(event, false)
    return null
  } else if (event.type !== 'message' || event.message.type !== 'text') {
    return null
  } else {
    const message: Types.Message = {
      type: 'text',
      text: event.message.text + '、って言いましたか？',
    }
    return client.replyMessage(event.replyToken, message)
  }
}

export const handler: Lambda.APIGatewayProxyHandler = async (
  apiEvent: Lambda.APIGatewayEvent
  // _context: any
) => {
  console.log(JSON.stringify(apiEvent))

  // 署名確認
  const signature = apiEvent.headers['X-Line-Signature']
  if (!Line.validateSignature(apiEvent.body!, channelSecret, signature)) {
    throw new Line.SignatureValidationFailed(
      'signature validation failed',
      signature
    )
  }

  const body: Line.WebhookRequestBody = JSON.parse(apiEvent.body!)
  await Promise.all(
    body.events.map(async (event) => eventHandler(event))
  ).catch((err) => {
    console.error(err.Message)
    return {
      statusCode: 500,
      body: 'Error',
    }
  })
  return {
    statusCode: 200,
    body: 'OK',
  }
}
