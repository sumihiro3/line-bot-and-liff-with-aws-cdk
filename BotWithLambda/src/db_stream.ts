import * as lambda from 'aws-lambda'
import * as aws from 'aws-sdk'
import * as dynamoDB from 'aws-sdk/clients/dynamodb'
import { KintoneRestAPIClient } from '@kintone/rest-api-client'

const KINTONE_API_URL = process.env.KINTONE_API_URL
const KINTONE_APP_ID = process.env.KINTONE_APP_ID || ''
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN

const kintoneClient: KintoneRestAPIClient = new KintoneRestAPIClient({
  baseUrl: KINTONE_API_URL,
  auth: {
    apiToken: KINTONE_API_TOKEN,
  },
})

async function upsertUserRecordToKintone(
  item: dynamoDB.AttributeMap
): Promise<any> {
  const itemRecord = aws.DynamoDB.Converter.unmarshall(item)
  const record = {
    active: {
      value: itemRecord['active'],
    },
    timestamp: {
      value: Math.round(parseInt(itemRecord['timestamp']) / 1000),
    },
  }
  try {
    kintoneClient.record.upsertRecord({
      app: KINTONE_APP_ID,
      updateKey: {
        field: 'id',
        value: itemRecord['id'],
      },
      record: record,
    })
  } catch (error) {
    console.error(`Error at upsertUserRecordToKintone: ${error}`)
  }
}

export const handler: lambda.DynamoDBStreamHandler = (
  event: lambda.DynamoDBStreamEvent
) => {
  event.Records.forEach((record) => {
    if (record && record.dynamodb) {
      console.log('イベント種別:', record.eventName)
      console.log('DynamoDB Record: %j', record.dynamodb)

      if (record.eventName == 'INSERT') {
        //項目が追加された時の処理
        const newItem: dynamoDB.AttributeMap | undefined =
          record.dynamodb.NewImage
        console.log('Inserted record:', newItem)
        if (newItem) {
          upsertUserRecordToKintone(newItem)
        }
      } else if (record.eventName == 'MODIFY') {
        //項目が変更された時の処理
        const oldItem: dynamoDB.AttributeMap | undefined =
          record.dynamodb.OldImage //変更前
        const newItem: dynamoDB.AttributeMap | undefined =
          record.dynamodb.NewImage //変更後
        console.log('Before update record:', oldItem)
        console.log('Updated record:', newItem)
        if (newItem) {
          upsertUserRecordToKintone(newItem)
        }
      } else if (record.eventName == 'REMOVE') {
        //項目が削除された時の処理
        const deletedItem = record.dynamodb.OldImage
        console.log('Deleted record:', deletedItem)
      } else {
        console.log('Nothing to do...')
      }
    }
  })
}
