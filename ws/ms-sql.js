const sql = require('mssql')
const msSql  = function(config, query){
 return new Promise((resolve, reject) => {
 	sql.connect(config, function (err) {
 		console.log(err)
 		if (err) {
 			reject({err:err})
 		}
 		const request = new sql.Request();
 		request.query(query, function (err, recordset) {
 			if (err) {
 				sql.close()
 				reject({err:err})
 			} else{
 				sql.close()
 				resolve({result:recordset.recordset})
 			}
 		});
 })
})
}
module.exports = msSql