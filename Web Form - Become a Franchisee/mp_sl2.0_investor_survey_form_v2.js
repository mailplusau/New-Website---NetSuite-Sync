/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @Author: Ankith Ravindran <ankithravindran>
 * @Date:   2021-09-15T17:02:45+10:00
 * @Filename: mp_sl2.0_become_a_zee_web_form_v2.js
 * @Last modified by:   ankithravindran
 * @Last modified time: 2022-02-07T10:40:42+11:00
 */



define(['N/runtime', 'N/http', 'N/https', 'N/log', 'N/url', 'N/email',
	'N/record', 'N/format', 'N/file'
], function(runtime, http, https, log,
	url, email, record, format, file) {
	function onRequest(context) {

		var role = runtime.getCurrentUser().role;
		var zee = 0;
		var customer_list_page = null;
		if (role == 1000) { // Role is Franchisee
			zee = runtime.getCurrentUser().id; // Get Franchisee ID
		} else {
			zee = 0;
		}

		log.debug({
			title: "context.request.method",
			details: context.request.method
		});
		log.debug({
			title: "context.request",
			details: context.request
		});
		log.debug({
			title: "context.request.parameters",
			details: context.request.parameters
		});

		var zeeLeadID = context.request.parameters.zeeleadid;
		var investment = context.request.parameters.investment;
		var finance = context.request.parameters.finance;
		var experience = context.request.parameters.experience;


		var params = {
			zeeLeadID: zeeLeadID,
			investment: investment,
			finance: finance,
			experience: experience
		};


		//Create Franchisee Sales Leads Record
		var zeeLeadRecord = record.load({
			type: 'customrecord_zee_sales_leads',
			id: parseInt(zeeLeadID)
		});

		if (investment != '0' && !isNullorEmpty(investment)) {
			zeeLeadRecord.setValue({
				fieldId: 'custrecord_investment_bracket',
				value: investment
			})
		}
		if (finance != '0' && !isNullorEmpty(finance)) {
			zeeLeadRecord.setValue({
				fieldId: 'custrecord_finance_required',
				value: finance
			})
		}
		if (experience != '0' && !isNullorEmpty(experience)) {
			zeeLeadRecord.setValue({
				fieldId: 'custrecord_years_of_experience',
				value: experience
			})
		}
		zeeLeadRecord.setValue({
			fieldId: 'custrecord_survey_filled',
			value: 1
		})

		zeeLeadRecord.save()

		// var suiteletUrl = url.resolveScript({
		// 	scriptId: 'customscript_merge_email',
		// 	deploymentId: 'customdeploy_merge_email',
		// 	returnExternalUrl: true
		// });
		//
		// suiteletUrl += '&rectype=customer&template=122';
		// suiteletUrl += '&recid=' + null + '&salesrep=' + null + '&dear=' + '' +
		// 	'&contactid=' + null + '&userid=' + userid;
		//
		// log.debug({
		// 	title: 'suiteletUrl',
		// 	details: suiteletUrl
		// });
		//
		// var response = https.get({
		// 	url: suiteletUrl
		// });
		//
		// var emailHtml = response.body;
		//
		// var arrAttachments = [];
		//
		// arrAttachments.push(file.load({
		// 	id: 5060506
		// }));
		//
		//
		// email.send({
		// 	author: 112209,
		// 	body: emailHtml,
		// 	recipients: email_address,
		// 	subject: 'Thank you for your MailPlus enquiry!',
		// 	attachments: arrAttachments
		// });


		var returnObj = {
			success: true,
			message: '',
			result: 'Email Sent'
		};

		context.response.setHeader({
			name: 'Content-Type',
			value: 'application/json'
		});
		var callbackFcn = context.request.parameters.jsoncallback || context.request
			.parameters.callback;
		if (callbackFcn) {
			context.response.writeLine(callbackFcn + "(" + JSON.stringify(returnObj) +
				");")
		} else
			context.response.writeLine(JSON.stringify(returnObj))

	}

	function isNullorEmpty(strVal) {
		return (strVal == null || strVal == '' || strVal == 'null' || strVal ==
			undefined || strVal == 'undefined' || strVal == '- None -' ||
			strVal ==
			'0');
	}


	/**
	 * retrieve date
	 */
	function getDate() {
		var date = new Date();
		if (date.getHours() > 6) {
			date.setDate(date.getDate() + 1);
		}

		format.format({
			value: date,
			type: format.Type.DATE,
			timezone: format.Timezone.AUSTRALIA_SYDNEY
		})

		return date;
	}

	Date.prototype.addHours = function(h) {
		this.setHours(this.getHours() + h);
		return this;
	}

	return {
		onRequest: onRequest
	};
});
