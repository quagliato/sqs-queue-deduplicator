const awsSqs = require('./clients/sqs')
const fs = require('fs')
const moment = require('moment')
const sha1 = require('sha1')
const {
  MESSAGE_BUFFER_SIZE,
  REPUBLISH
} = process.env

async function downloadAndDeduplicateMessages (masterList) {
  if (!masterList) masterList = {}
  const message = await awsSqs.getMessage()
  if (message.Messages) {
    global.log(`${message.Messages.length} new message(s).`)
    message.Messages.map(message => {
      global.log(`Processing message ${message.MessageId}.`)
      const messageBody = JSON.parse(message.Body)
      const messageBodyText = JSON.stringify(messageBody)
      const messageKey = sha1(messageBodyText)
      if (!masterList[messageKey]) {
        masterList[messageKey] = messageBody
        global.log(`Message is new.`)
      } else {
        global.log(`Message already processed, ignoring it...`)
      }
    })
  } else {
    global.log(`Pulling does not have new messages.`)
  }

  if (message.Messages.length < MESSAGE_BUFFER_SIZE) return masterList

  return downloadAndDeduplicateMessages(masterList)
}

function publishList (masterList) {
  global.log(`Republishing ${Object.keys(masterList).length} messages...`)
  return Object.values(masterList).map(async item => {
    global.log(`Publishing new message...`)
    const messageReturn = await awsSqs.sendMessage(JSON.stringify(item))
    global.log(`Message published: ${messageReturn.MessageId}.`)
  })
}

function enqueueFromFile(filepath) {
  const fileContent = fs.readFileSync(filepath, { encoding: 'utf8' })
  const entries = fileContent.split('\n')
  return entries.map(async entry => await awsSqs.sendMessage(entry))
}

async function runAll() {
  const masterList = await downloadAndDeduplicateMessages()
  const processFilename = `./processedQueue-${moment().format('YYYYMMDDHHmmss')}.txt`
  global.log(`Writing result to ${processFilename}...`)
  fs.writeFileSync(processFilename, Object.values(masterList).map(item => JSON.stringify(item)).join('\n'))
  global.log(`Deduplicated list written to file ${processFilename}.`)
  if (REPUBLISH === '1') await publishList(masterList)
}

module.exports = {
  downloadAndDeduplicateMessages,
  enqueueFromFile,
  publishList,
  runAll
}
