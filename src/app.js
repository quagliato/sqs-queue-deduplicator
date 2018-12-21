const awsSqs = require('./clients/sqs')
const moment = require('moment')
const {
  runAll
} = require('./queue')

global.log = (message, level) => {
  const timestamp = moment().format('YYYY-MM-DD HH:mm:ss.SSS Z')
  if (!level) level = 'INFO'
  console.log(`${timestamp} [${level.toUpperCase()}] ${message}`)
}

try {
  global.log('Starting...')
} catch (err) {
  console.log(err)
} finally {
  runAll()
}
