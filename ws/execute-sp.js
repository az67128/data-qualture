const { Pool } = require('pg')

const config = require('./config')

function Singleton() {
    client = null;
    const pgPool = new Pool(config.db)
    pgPool.connect()
    .then(createdClient => {
    	client = createdClient
    })
    .catch(err=>{
    	console.log('connection failed')
    	console.log(err)
    })
    
    this.execute = function execute(requestParams, schema='ws') {
    	return new Promise((resolve, reject) => {
    
    		isClientExist()
    		function isClientExist(){
    			if (client){
    				query()
    			}else{
    				setTimeout(isClientExist,100)
    			}
    		}
    		function query(){
    			var parametrs = '';
    			var sp = '';
    			for (var key in requestParams){
    				if (key !== 'sp') {
    					var value = null
    					if (requestParams[key]&&requestParams[key]!==0){
    			
    						value = "'" + requestParams[key].toString().replace(/'/g , "''") + "'"
    					}
    					parametrs += `_${key}=>${value},`
    				} else {
    					sp = requestParams[key];
    				}
    			}
    			if (!sp){
    				reject({err:'sp is not defined'});
    			}
    			parametrs = parametrs.slice(0,-1);
    			const query = `SELECT * FROM ${schema}.${sp}(${parametrs})`;
    			console.log(query)
    			client.query(query)
    			.then(result=>{
    				resolve({result:result.rows})
    			})
    			.catch(err=>{
    				console.log(err)
    				reject({err:'error in query ' + query})
    			})
    			
    			
    		}
    	})
    }
}

var singleton = new Singleton();

module.exports = function (requestParams, schema) {
    return singleton.execute(requestParams, schema);
}