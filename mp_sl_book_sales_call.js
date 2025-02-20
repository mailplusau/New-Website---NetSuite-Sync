/*
 * Author:               Ankith Ravindran
 * Created on:           
 * Modified on:          Tue Sep 24 2024 14:05:42
 * SuiteScript Version:   
 * Description:           
 *
 * Copyright (c) 2024 MailPlus Pty. Ltd.
 */

var ctx = nlapiGetContext();

var zee = 0;
var role = ctx.getRole();
var row_count = 0;
var customer_list_page = null;
if (role == 1000) {
	//Role is Franchisee
	zee = ctx.getUser(); //Get Franchisee ID
} else {
	zee = 0;
}

function bookSalesCall(request, response) {
	if (request.getMethod() == "GET") {
		nlapiLogExecution("DEBUG", "request.getParameter", request.getParameter);

		var contactid = request.getParameter("contactid");
		var customerInternalId = request.getParameter("customerInternalId");
		var first_name = request.getParameter("first_name");
		var last_name = request.getParameter("last_name");
		var email = request.getParameter("email");
		var phone_number = request.getParameter("phone_number");
		var dateVal = request.getParameter("dateVal");
		var timeVal = request.getParameter("timeVal");

		nlapiLogExecution("DEBUG", "contactid", contactid);
		nlapiLogExecution("DEBUG", "customerInternalId", customerInternalId);
		nlapiLogExecution("DEBUG", "first_name", first_name);
		nlapiLogExecution("DEBUG", "last_name", last_name);
		nlapiLogExecution("DEBUG", "email", email);
		nlapiLogExecution("DEBUG", "phone_number", phone_number);
		nlapiLogExecution("DEBUG", "dateVal", dateVal);
		nlapiLogExecution("DEBUG", "timeVal", timeVal);

		var params = {
			contactid: contactid,
			customerInternalId: customerInternalId,
			first_name: first_name,
			last_name: last_name,
			email: email,
			phone_number: phone_number,
			dateVal: dateVal,
			timeVal: timeVal,
		};

		var endTime;
		var timeArray = timeVal.split(":");
		if (parseInt(timeArray[0]) >= 12) {
			if (parseInt(timeArray[0]) == 12) {
				timeVal = 1 + ":" + timeArray[1] + " PM";
				endTime = 1 + 1 + ":" + timeArray[1] + " PM";
			} else {
				timeVal = parseInt(timeArray[0]) - 12 + ":" + timeArray[1] + " PM";
				endTime = parseInt(timeArray[0]) - 12 + 1 + ":" + timeArray[1] + " PM";
			}
		} else {
			timeVal = timeVal + " AM";
			if (parseInt(timeArray[0]) == 11) {
				endTime = "12" + ":" + timeArray[1] + " PM";
			} else {
				endTime = parseInt(timeArray[0]) + 1 + ":" + timeArray[1] + " AM";
			}
		}

		nlapiLogExecution("DEBUG", "timeVal", timeVal);
		nlapiLogExecution("DEBUG", "endTime", endTime);

		var customerRecord = nlapiLoadRecord("customer", customerInternalId);
		var entity_id = customerRecord.getFieldValue("entityid");
		var entitystatus = customerRecord.getFieldValue("entitystatus");
		var business_name = customerRecord.getFieldText("companyname");
		var partner_text = customerRecord.getFieldText("partner");
		if (entitystatus != 13) {
			customerRecord.setFieldValue("entitystatus", 8);
		}

		nlapiSubmitRecord(customerRecord);

		var recContact = nlapiLoadRecord("contact", contactid);
		var contactEmail = recContact.getFieldValue("email");
		recContact.setFieldValue("firstname", first_name);
		recContact.setFieldValue("lastname", last_name);
		recContact.setFieldValue("email", email);
		recContact.setFieldValue("phone", phone_number);

		try {
			contactid = nlapiSubmitRecord(recContact);
		} catch (error) {
			var email_body =
				"New Lead trying to book a sales call but contact already exists in NetSuite. </br></br>";
			email_body += "<u><b>Contact Details</b></u> </br>";
			email_body += "First Name: " + first_name + "</br>";
			email_body += "Last Name: " + last_name + "</br>";
			email_body += "Email: " + email + "</br>";
			email_body += "Phone: " + phone_number + "</br></br>";
			email_body +=
				"<u><b>Customer Details</b></u> </br>Existing Customer? YES </br>Customer NS ID: " +
				customerInternalId +
				"</br>";
			email_body +=
				"Customer Name: " + entity_id + " " + business_name + "</br>";
			email_body += "Franchisee: " + partner_text + "</br></br>";

			var email_subject =
				"Auto Sign Up - Contact Exists - " + entity_id + " " + business_name;

			var records = new Array();
			records["entity"] = customerInternalId;

			nlapiSendEmail(
				112209,
				["laura.busse@mailplus.com.au"],
				email_subject,
				email_body,
				[
					"popie.popie@mailplus.com.au",
					"ankith.ravindran@mailplus.com.au",
					"fiona.harrison@mailplus.com.au",
				],
				null,
				records,
				null,
				true
			);
		}

		//All Leads - Get Latest Sales Record
		var salesRecordAutoSigned = nlapiLoadSearch("customer", "customsearch9140");

		var newFilters_addresses = new Array();
		newFilters_addresses[0] = new nlobjSearchFilter(
			"internalid",
			null,
			"is",
			customerInternalId
		);

		salesRecordAutoSigned.addFilters(newFilters_addresses);

		var salesRecordAutoSignedResult = salesRecordAutoSigned.runSearch();

		var salesRecordAutoSignedResultSet = salesRecordAutoSignedResult.getResults(
			0,
			1
		);

		var salesRepId = null;

		if (salesRecordAutoSignedResultSet.length != 0) {
			salesRecordAutoSignedResult.forEachResult(function (searchResult) {
				salesRepId = searchResult.getValue(
					"custrecord_sales_assigned",
					"CUSTRECORD_SALES_CUSTOMER",
					"GROUP"
				);

				return true;
			});
		}

		var splitDate = dateVal.split("-");
		var callback_date = splitDate[2] + "/" + splitDate[1] + "/" + splitDate[0];

		var notes =
			"Sales Call Booked: " + callback_date + ". Call Back Time: " + timeVal;

		var task = nlapiCreateRecord("task");
		task.setFieldValue("title", "Sales Call Booked");
		task.setFieldValue("assigned", salesRepId);
		task.setFieldValue("company", customerInternalId);
		task.setFieldValue("sendemail", "T");
		task.setFieldValue("timedevent", "T");
		task.setFieldValue("duedate", callback_date);
		task.setFieldValue("starttime", timeVal);
		task.setFieldValue("endtime", endTime);
		task.setFieldText("remindertype", "Email");
		task.setFieldText("reminderminutes", "30 minutes");
		task.setFieldValue("message", notes);
		task.setFieldText("status", "Not Started");
		nlapiSubmitRecord(task);

		var returnObj = {
			success: true,
			message: "",
			result: "",
		};

		_sendJSResponse(request, response, returnObj);

		var url =
			"https://1048144.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=395&deploy=1&compid=1048144&ns-at=AAEJ7tMQgAVHkxJsbXgGwQQm4xn968o7JJ9-Ym7oanOzCSkWO78&rectype=customer&template=";
		var template_id = 149;
		var newLeadEmailTemplateRecord = nlapiLoadRecord(
			"customrecord_camp_comm_template",
			template_id
		);
		var templateSubject = newLeadEmailTemplateRecord.getFieldValue(
			"custrecord_camp_comm_subject"
		);
		var emailAttach = new Object();
		emailAttach["entity"] = customerInternalId;

		url +=
			template_id +
			"&recid=" +
			customerInternalId +
			"&salesrep=" +
			653718 +
			"&dear=" +
			first_name +
			"&contactid=" +
			contactid +
			"&userid=" +
			encodeURIComponent(nlapiGetContext().getUser());
		urlCall = nlapiRequestURL(url);
		var emailHtml = urlCall.getBody();

		nlapiSendEmail(
			112209,
			email,
			templateSubject,
			emailHtml,
			null,
			null,
			emailAttach
		);
	}

	function _sendJSResponse(request, response, respObject) {
		response.setContentType("JAVASCRIPT");
		// response.setHeader('Access-Control-Allow-Origin', '*');
		var callbackFcn =
			request.getParameter("jsoncallback") || request.getParameter("callback");
		if (callbackFcn) {
			response.writeLine(callbackFcn + "(" + JSON.stringify(respObject) + ");");
		} else response.writeLine(JSON.stringify(respObject));
	}
}
