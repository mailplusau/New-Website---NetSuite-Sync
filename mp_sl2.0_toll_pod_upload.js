/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @Author: Ankith Ravindran <ankithravindran>
 * @Date:   2021-11-12T10:08:58+11:00
 * @Last modified by:   ankithravindran
 * @Last modified time: 2021-11-12T10:18:23+11:00
 */


define(['N/runtime', 'N/http', 'N/https', 'N/log', 'N/url', 'N/email',
		'N/record', 'N/format', 'N/file'], function(runtime, http, https, log,
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
			title : "context.request.method",
			details : context.request.method
		});
		log.debug({
			title : "context.request",
			details : context.request
		});
		log.debug({
			title : "context.request.parameters",
			details : context.request.parameters
		});

		var operators = context.request.parameters.operators;
		var locationLeft = context.request.parameters.locationLeft;


		var params = {
			operators : operators,
			locationLeft : locationLeft
		};

		log.debug({
			title : "params",
			details : JSON.stringify(params)
		});

		var returnObj = {
			success : true,
			message : '',
			result : 'Email Sent'
		};

		context.response.setHeader({
			name : 'Content-Type',
			value : 'application/json'
		});
		var callbackFcn = context.request.parameters.jsoncallback
				|| context.request.parameters.callback;
		if (callbackFcn) {
			context.response.writeLine(callbackFcn + "("
					+ JSON.stringify(returnObj) + ");")
		} else
			context.response.writeLine(JSON.stringify(returnObj))

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
			value : date,
			type : format.Type.DATE,
			timezone : format.Timezone.AUSTRALIA_SYDNEY
		})

		return date;
	}

	Date.prototype.addHours = function(h) {
		this.setHours(this.getHours() + h);
		return this;
	}

	return {
		onRequest : onRequest
	};
});
