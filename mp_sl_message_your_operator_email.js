/*
 * Author:               Ankith Ravindran
 * Created on:           Wed May 22 2024
 * Modified on:          Wed May 22 2024 15:15:17
 * SuiteScript Version:  1.0 
 * Description:          Send email to the franchisee including the message from the customer when "Message Your Operator" button is clicked from the customer portal.  
 *
 * Copyright (c) 2024 MailPlus Pty. Ltd.
 */


var ctx = nlapiGetContext();

var zee = 0;
var role = ctx.getRole();
var row_count = 0;
var customer_list_page = null;
if (role == 1000) { //Role is Franchisee
    zee = ctx.getUser(); //Get Franchisee ID
} else {
    zee = 0;
}

function emailYourOperator(request, response) {
    if (request.getMethod() == "GET") {

        nlapiLogExecution('DEBUG', 'request.getParameter', request.getParameter);

        var email = request.getParameter('email');
        var customerInternalId = request.getParameter('customerInternalId');
        var message = request.getParameter('message');

        nlapiLogExecution('DEBUG', 'email', email);
        nlapiLogExecution('DEBUG', 'customerInternalId', customerInternalId);
        nlapiLogExecution('DEBUG', 'message', message);

        var params = {
            email: email,
            customerInternalId: customerInternalId,
            message: message
        };


        var customerRecord = nlapiLoadRecord('customer', customerInternalId);
        var entity_id = customerRecord.getFieldValue('entityid');
        var entitystatus = customerRecord.getFieldValue('entitystatus');
        var business_name = customerRecord.getFieldValue('companyname');
        var partner_text = customerRecord.getFieldText('partner');
        var partner_id = customerRecord.getFieldValue('partner');

        var partner_email = nlapiLoadRecord('partner', partner_id).getFieldValue('email');
        var partner_phone = nlapiLoadRecord('partner', partner_id).getFieldValue('custentity2');

        partner_phone = partner_phone.replace(/ /g, '');
        partner_phone = partner_phone.slice(1);
        partner_phone = '+61' + partner_phone;

        nlapiLogExecution('DEBUG', 'partner_email', partner_email);
        nlapiLogExecution('DEBUG', 'partner_phone', partner_phone);

        var emailAttach = new Object();
        emailAttach['entity'] = customerInternalId;

        // Email to be sent out to Corrine about the new LPO Lead.
        var from = 112209; //MailPlus team
        var to = partner_email;
        var bcc = ['dispatcher@mailplus.com.au', 'customerservice@mailplus.com.au'];
        var emailSubject = 'Message from your Customer - ' + business_name + '(Franchisee: ' + partner_text + ')';

        var emailBody =
            'Message : ' + message;


        nlapiSendEmail(from, to, emailSubject, emailBody, null, bcc, emailAttach, null, true);

        var headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic QUNjNGZiOTNkYzE3NWI4ZjkwNjZlZDgwYmYwY2FlY2RiNzo3ZTFlZjEzNTM1ZjFmNzI1NmVjY2YwNzU4MWIwMWYxMg=="
        };

        var postdata = {
            "Body": 'Message from your customer - ' + business_name + '(Franchisee: ' + partner_text + '). Please check your emails for more details.',
            "To": partner_phone,
            "From": "+61488883115"
        }

        var smsResponse = nlapiRequestURL("https://api.twilio.com/2010-04-01/Accounts/ACc4fb93dc175b8f9066ed80bf0caecdb7/Messages", postdata, headers, "POST");


        var returnObj = {
            success: true,
            message: '',
            result: ''
        };

        _sendJSResponse(request, response, returnObj);

    }

    function _sendJSResponse(request, response, respObject) {
        response.setContentType('JAVASCRIPT');
        // response.setHeader('Access-Control-Allow-Origin', '*');
        var callbackFcn = request.getParameter("jsoncallback") || request.getParameter('callback');
        if (callbackFcn) {
            response.writeLine(callbackFcn + "(" + JSON.stringify(respObject) + ");");
        } else response.writeLine(JSON.stringify(respObject));
    }
}

function getDate() {
    var date = new Date();
    if (date.getHours() > 6) {
        date = nlapiAddDays(date, 1);
    }
    date = nlapiDateToString(date);
    return date;
}