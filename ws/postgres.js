const pg = require('pg');


const postgres  = function(config, query){
 return new Promise((resolve, reject) => {
  const pool = new pg.Pool(config);
  pool.connect(function (err, client, done) {
	if (err) {
		reject({err:"Can not connect to the DB" + err})
	}
	
	if (!query){
		reject({err:'no script to execute'})
	}
	
	client.query(query, function (err, result) {
		console.log(err)
		done();
		client.end()
		pool.end()
		if (err) {
			reject({err:err})
		} 
		if (result){
			resolve({result:result.rows})
		} else {
			reject({err:'error in query ' + query})
		}
	})

  })
  })
}

module.exports = postgres;