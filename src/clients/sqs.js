const AWS = require('aws-sdk')
const {
  AWS_SQS_QUEUE_URL,
  AWS_SQS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  MESSAGE_BUFFER_SIZE,
  AWS_SQS_NEW_QUEUE_URL
} = process.env

const sqs = new AWS.SQS({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_SQS_REGION
})

function sendMessage (MessageBody) {
  const publishParams = {
    MessageBody,
    QueueUrl: AWS_SQS_NEW_QUEUE_URL
  }

  return sqs.sendMessage(publishParams).promise()
}

function deleteMessage (receiptHandle) {
  const deleteParams = {
    QueueUrl: AWS_SQS_QUEUE_URL,
    ReceiptHandle: receiptHandle
  }

  return sqs.deleteMessage(deleteParams).promise()
}

function getMessage () {
  const receiveParams = {
    QueueUrl: AWS_SQS_QUEUE_URL,
    AttributeNames: ['All'],
    MaxNumberOfMessages: MESSAGE_BUFFER_SIZE
  }

  return sqs.receiveMessage(receiveParams).promise()
}

module.exports = {
  getMessage,
  deleteMessage,
  sendMessage
}
