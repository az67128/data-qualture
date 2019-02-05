const jwt = require('jsonwebtoken');
const {token} = require('./config')

function TokenGenerator (secretOrPrivateKey, secretOrPublicKey, options) {
  this.secretOrPrivateKey = secretOrPrivateKey;
  this.secretOrPublicKey = secretOrPublicKey;
  this.options = options; //algorithm + keyid + noTimestamp + expiresIn + notBefore
}

TokenGenerator.prototype.sign = function(payload, signOptions) {
  const jwtSignOptions = Object.assign({}, signOptions, this.options);
  return jwt.sign(payload, this.secretOrPrivateKey, jwtSignOptions);
}

TokenGenerator.prototype.refresh = function(token, refreshOptions) {
  const payload = jwt.verify(token, this.secretOrPublicKey, refreshOptions.verify);
  delete payload.iat;
  delete payload.exp;
  delete payload.nbf;
  delete payload.jti; 
  const jwtSignOptions = Object.assign({ }, this.options, { jwtid: refreshOptions.jwtid });
  return jwt.sign(payload, this.secretOrPrivateKey, jwtSignOptions);
}

TokenGenerator.prototype.verify = function(token) {
  return jwt.verify(token, this.secretOrPublicKey);
 } 
 
module.exports = TokenGenerator;