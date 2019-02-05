const {cors} = require('./config')

function setHeaders(req, res, next) {
	if (cors.allowedOrigin.indexOf(req.headers.origin)>-1){
		res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
		res.setHeader('Access-Control-Allow-Credentials', 'true')
		res.setHeader('Vary', 'Origin')
		
	}
	res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'authorization, origin, content-type, accept, refresh')
	res.setHeader('Cache-Control', 'no-cache, must-revalidate')
	res.setHeader('Pragma', 'no-cache')
	res.setHeader('Expires', 'Sat, 26 Jul 1997 05:00:00 GMT')
	next()
  }
module.exports = setHeaders