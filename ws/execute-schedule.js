
const executeSp = require('./execute-sp')
const {executeQuery} = require('./execute-query')

const {schedule} = require('./config')

const executeSchedule  = function(){
	const scheduler = setInterval(execute, schedule.interval)
	console.log('Query execution process is running')
	function execute(){
		console.log('----execution start ' + Date())
		const startTime = new Date(Date.now() - schedule.interval)
		
		const endTime = new Date()
		const startWeekDay = startTime.getDay()-1 
		const endWeekDay = endTime.getDay()-1
		const schedule_time_start = startTime.getHours()+":"+startTime.getMinutes()+":"+startTime.getSeconds()
		const schedule_time_end = endTime.getHours()+":"+endTime.getMinutes()+":"+endTime.getSeconds()
		const weekDays = ['mn','tu','wd','th','fr','sa','sn']
		
		executeSp({
		  sp:'get_query_by_schedule',
		  start_week_day:weekDays[startWeekDay],
		  end_week_day:weekDays[endWeekDay],
		  schedule_time_start:schedule_time_start,
		  schedule_time_end:schedule_time_end
		}).then(response=>{
		  const queue = response.result.map(item=>{
		  		console.log('-exexuting query ' + item.query_id)
				return executeQuery(item.query_id)
		  })
		  return Promise.all(queue)
		})
		.then(response=>{
			//console.log(JSON.stringify(response.result))
			console.log('----execution end ' + Date())
		})
		.catch(err=>{
			console.log('----Failed to execute schedule')
			console.log(err)
		})
		
	}
	
}

module.exports = executeSchedule