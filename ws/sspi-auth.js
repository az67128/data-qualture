function sspiAuth(req, res, next) {
  if (req.url.indexOf('/auth') <0 || req.query.provider !== 'sspi'){
  	res.finished || next()
  	return
  }
  var nodeSSPI = require('node-sspi')
  var nodeSSPIObj = new nodeSSPI({
    retrieveGroups: true
  })
  nodeSSPIObj.authenticate(req, res, function(err){
    res.finished || next()
  })
}
module.exports = sspiAuth