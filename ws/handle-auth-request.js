const tokenGenerator = require('./token-generator')
const executeSp = require('./execute-sp')
const {token} = require('./config')
const tg = new tokenGenerator(token.secret, token.secret)

function handleAuthRequest(req, res, next) {
    auth(req)
	.then(user=>{
		const tokenPair = createToken(user)
		
		res.status(200)
		.send({
			body: {message:'welcome'},
			accessToken: tokenPair.access,
			refreshToken: tokenPair.refresh
		})
	})
	.catch(err => {
		console.log(err)
		res.status(403).send(err)
	})

}

function createToken(user){
	const accessToken = tg.sign({
		type: 'access',
		device_guid: user.device_guid,
		user_id:user.user_id
	}, {
		expiresIn: token.accessTokenExpiresIn
	})
	
	const refreshToken = tg.sign({
		type: 'refresh',
		user_id: user.user_id,
		person_name:user.person_name,
		device_guid: user.device_guid,
		refresh_guid: user.refresh_guid,
		picture_link: encodeURIComponent(user.picture_link)
	}, {
		expiresIn: token.refreshTokenExpiresIn
	})
	return {
		access:accessToken,
		refresh:refreshToken
	}
}


function auth(req){
 const query = JSON.parse(req.body)
 return new Promise((resolve, reject)=>{
  if (query.sp=='login'){
  	if(query.provider ==='sspi'){
  		query.login = req.connection.user
  	}
	executeSp(query, 'auth')
	.then(response=>{
	
	  if(response.result[0].result !=='Loggined'){
	  	reject({err:'Not authorized'})
	  	return
	  } 
	  resolve(response.result[0])
	})
	.catch(err=>{
		reject({err:'db error'})
		
	}) 
  }
  if (query.sp=='refresh_guid'){
	try {
		let token = req.headers['refresh']
		
		var decoded = tg.verify(token)
	} catch (err) {
		reject(err)
		return
	}
	query.person_id = decoded.user_id
	query.device_guid = decoded.device_guid
	query.refresh_guid = decoded.refresh_guid
	executeSp(query, 'auth')
	.then(response=>{
		if(response.result[0].result !=='Refreshed'){
			reject({err:'Not authorized'})
			return
		} 
		resolve(response.result[0])
	})
	.catch(err=>{
		reject({err:'db error'})
	})
  }
 })
}

module.exports = handleAuthRequest