require('dotenv').config({
  silent:true
})

const {
  enqueueFromFile
} = require('./src/queue')

console.log(enqueueFromFile(process.argv[2]))