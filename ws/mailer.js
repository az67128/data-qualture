const nodemailer = require('nodemailer');
const executeSp = require('./execute-sp')
const {email} = require('./config')


const mailer  = function(){
	console.log('Mailer process is running')
	const scheduler = setInterval(sendMail, 1000)

function sendMail(){
	const now = new Date()
	if (now.getUTCHours() !== email.startHour || 
		now.getMinutes() !== email.startMinute ||
		now.getSeconds() !== 0){
		return
	}
	console.log('---Start sending emails')
	getUserList()
	.then(recipientList=>{
		const recipientErrors = recipientList.map(item=>{
			return getEmailData(item)
		})
		return Promise.all(recipientErrors)
	})
	.then(response=>{
	 	let transporter = nodemailer.createTransport(email.smtp)
	 	
		response.forEach(item=>{
			let mailOptions = {
			from: email.from, 
			to: item.recipient.email, 
			subject: 'Fix data errors', 
			html: prepareEmail(item)
			}
			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					return console.log(error);
				}
				console.log('Message sent: %s', info.messageId);
			})
		})
		
		console.log('---end sending emails')
	})
}

function getUserList(){
	return executeSp({sp:'get_user_list_with_errors'})
	.then(response=>{
		return response.result
	})
}

function getEmailData(recipient){
	return executeSp(
		{sp:'get_user_error_list_for_email',
		email:recipient.email}
	)
	.then(response=>{
		return {recipient:recipient,
				report:response.result,
				error_count:recipient.error_count,
				new_error:recipient.new_error}
	})
}
function prepareEmail(data){
	const {recipient, report} = data
	let errorReport = ''
	report.forEach(item=>{
		errorReport+=prepareReportRow(item)
	})
	return `<table border="0" cellpadding="0" width="100%" style="width:100.0%">
    <tbody>
        <tr>
            <td style="padding:.75pt .75pt 22.5pt .75pt">
                <p><span style="font-size:27.5pt">Fix data errors</span></p>
            </td>
        </tr>
        <tr>
            <td style="padding:.75pt .75pt .75pt .75pt">
                <table border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100.0%;border-collapse:collapse">
                    <tbody>
                        ${errorReport}
                    </tbody>
                </table>
            </td>
        </tr>
        <tr style="height:11.25pt">
            <td style="padding:.75pt .75pt .75pt .75pt;height:11.25pt"></td>
        </tr>
        <tr>
            <td style="padding:.75pt .75pt .75pt .75pt">
                <p><span>We found </span><span><b><span style="font-size:13.0pt">
                                <a href="${email.systemUrl}/#/mydq/${data.recipient.person_id}" style="color:#549beb">${data.error_count}
                                    errors</a></span></b></span><span>,
                        and <a href="${email.systemUrl}/#/mydq/${data.recipient.person_id}" style="color:#549beb">
                            <b>${data.new_error} of them is new.</b></a></span></p>
            </td>
        </tr>
        <tr style="height:11.25pt">
            <td style="padding:.75pt .75pt .75pt .75pt;height:11.25pt"></td>
        </tr>
        <tr>
            <td colspan="2" style="padding:.75pt .75pt .75pt .75pt">
                <p>
                    <span style="color:#bdbdbd">
                        <a href="${email.systemUrl}/#/help">
                            <span style="color:#bdbdbd">What is Data Quality</span></a> 
                    </span></p>
            </td>
        </tr>
    </tbody>
</table>`


}
function prepareReportRow(row){
	let messageTemplate = row.email_template || 
	`DQ team found an issue in query ${row.query_name}.${row.is_new? ' It is new':''}.`
	const error_report = JSON.parse(row.error_report)
	Object.keys(error_report).forEach(key=>{
		messageTemplate = messageTemplate.replace('${'+key+'}', error_report[key])
	})
	return `<tr>
				<td style="border:solid #cfd8dc 1.0pt;padding:7.5pt 7.5pt 7.5pt 7.5pt">
					<table border="0" cellpadding="0" style="margin-left:7.5pt">
						<tbody>
							<tr>
								<td width="40" rowspan="3" style="width:30.0pt;padding:7.5pt 7.5pt 7.5pt 7.5pt">
									<div align="center">
										<table border="0" cellpadding="0" width="80" style="width:60.0pt">
											<tbody>
												<tr style="height:60.0pt">
													<td width="80" style="width:60.0pt;background:#549beb;padding:0in 7.5pt 0in 7.5pt;height:60.0pt">
														<p class="MsoNormal" align="center" style="text-align:center">
															<span style="font-size:44.0pt">
																<a href="${email.systemUrl}/#/datasource/${row.datasource_name}" style="text-decoration: none">
																	<b>
																		<span style="color:white">${row.datasource_name.slice(0, 1)}</span></b></a></span></p>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
									<p class="MsoNormal" align="center" style="text-align:center">
										<span style="color:#549beb"><br>
											<span>
												<a href="${email.systemUrl}/#/datasource/${row.datasource_name}" style="color:#549beb"><b>${row.datasource_name}</b></a></span>
										</span></p>
								</td>
								<td style="padding:7.5pt 7.5pt 7.5pt 7.5pt">
									<p>
										<b><span style="font-size:13.0pt">
												${messageTemplate}
											</span></b></p>
								</td>
							</tr>
							<tr>
								<td style="padding:7.5pt 7.5pt 7.5pt 7.5pt">
									<p>${row.query_justification}</p>
								</td>
							</tr>
							<tr>
								<td style="padding:7.5pt 7.5pt 7.5pt 7.5pt">
									<p>${row.query_hint}<a href="${email.systemUrl}/#/query/${row.query_id}" style="color:#549beb"><b><br>
												<span>More...</span></b></a></p>
								</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>`
	
	
}
}


module.exports = mailer