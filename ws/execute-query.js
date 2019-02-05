
const executeSp = require('./execute-sp')
const connector = {
	'Postgres':require('./postgres'),
	'MSSQL':require('./ms-sql'),
	'Oracle':require('./oracle')
}
function handleExecuteQuery(req, res, next) {
    const query = JSON.parse(req.body)	
  	executeQuery(query.query_id)
	.then(response=>
		res.status(200)
		.send({body:response.result})
	)
	.catch(err=>{
		console.log(err)
		res.status(400).send({error:err})
    })
}

const executeQuery  = function(query_id){
 return new Promise((resolve, reject) => {
    const startDate = new Date().toISOString()
    executeSp({
			sp:'get_execution_params',
			query_id:query_id
	}, 'backend')
	.then(response=>{
		const data = response.result[0]
		return data
	})
	.then(executionParams=>{
		if (!executionParams.error_report_script){
			reject({err:'no script to execute'})
			return
		}
		executionParams.config = JSON.parse(executionParams.config)	
		if (!connector.hasOwnProperty(executionParams.connection_name)){
			reject({err:`Connector ${executionParams.connection_name} not exist`})
			return
		}
		return connector[executionParams.connection_name](executionParams.config, executionParams.error_report_script)
		
	})
	.then(response=>{
		return executeSp({
			query_id:query_id,
			sp:'update_query_error',
			error_report:JSON.stringify( response.result),
			execution_start:startDate
			}, 'backend')
	})
	.then(response=>{
		resolve(response)
	})
	.catch(err=>{
		
		reject({
		  description:'Failed to execute query',
		  query_id:query_id,
		  err:err})
	})	
  })
}


module.exports = {handleExecuteQuery:handleExecuteQuery,
					 executeQuery: executeQuery}