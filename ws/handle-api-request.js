const tokenGenerator = require('./token-generator')
const executeSp = require('./execute-sp')
const {token} = require('./config')
const tg = new tokenGenerator(token.secret, token.secret)

function handleApiRequest(req, res, next) {
	const query = JSON.parse(req.body)
	console.log(query)
    if (query.remote_user){
  		try {
  			let token = (req.headers['authorization']||'').slice(7)
			var decoded = tg.verify(token)
  		} catch(err) {
  			console.log(err)
  			res.status(403).send(err)
  			return
  		}
  		query.remote_user = decoded.user_id
  	}
  	executeSp(query, 'ws')
	.then(response=>
		res.status(200)
		.send({body:response.result})
	)
	.catch(err=>{
		res.status(400).send(err.err)
    })
  }
  
  
 module.exports = handleApiRequest