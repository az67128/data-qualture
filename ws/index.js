const express = require('express') 
const bodyParser = require('body-parser')
const {fileSizeLimit} = require('./config') 
const executeSchedule = require('./execute-schedule')
const sspiAuth = require('./sspi-auth')
const mailer = require('./mailer')

const PORT = process.env.PORT || 80

const app = express() 

app.use(bodyParser.urlencoded({limit: fileSizeLimit,extended: true}));
app.use(bodyParser.json({limit: fileSizeLimit}));
app.use(bodyParser.text({limit: fileSizeLimit}));


const setHeaders = require('./set-headers')

const handleApiRequest = require('./handle-api-request') 	 
const handleAuthRequest = require('./handle-auth-request')
const {handleExecuteQuery} = require('./execute-query') 	 
  	 
app.all('/*', setHeaders)
app.use(sspiAuth)
app.get('/', (req, res, next) =>{
	res.status(200)
	.send({body:'running'})
})
app.post('/api', handleApiRequest)
app.post('/execute', handleExecuteQuery)

app.post('/auth', handleAuthRequest)

app.listen(PORT, function () {
    console.log(`Server is running.. on Port ${PORT}!`)
})

executeSchedule()
mailer()