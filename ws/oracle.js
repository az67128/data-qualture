

const oracle  = function(config, query){
	const oracledb = require('oracledb');
 return new Promise((resolve, reject) => {
 if (!query){
 	reject({err:'no script to execute'})
 	return;
 }
oracledb.getConnection(
  config,
  function(err, connection) {
    if (err) {
      reject(err.message);
      return;
    }
    connection.execute(query, [],
      function(err, result) {
        if (err) {
          doRelease(connection);
          reject(err.message);
          return;
        }
        doRelease(connection);
		console.log(result)
		const data = result.rows.map(row=>{
			const rowParsed = {}
			row.forEach((cell, i)=>{
				rowParsed[result.metaData[i].name] = cell
			})
			return rowParsed
		})
        resolve({result:data})
      });
  });

function doRelease(connection) {
  connection.close(
    function(err) {
      if (err)
        console.error(err.message);
    });
}
})
}

module.exports = oracle