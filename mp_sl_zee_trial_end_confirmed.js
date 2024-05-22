/*
 * Author:               Ankith Ravindran
 * Created on:           Thu May 23 2024
 * Modified on:          Thu May 23 2024 08:50:26
 * SuiteScript Version:  1.0 
 * Description:           
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

function zeeTrialEndConfirmed(request, response) {
    if (request.getMethod() == "GET") {

        nlapiLogExecution('DEBUG', 'request.getParameter', request);

        var customerRecordId = request.getParameter('custinternalid');

        var customerRecord = nlapiLoadRecord('customer', customerRecordId);

        var companyName = customerRecord.getFieldValue('companyname');

        customerRecord.setFieldValue('custentity_end_trial_confirmed_zee', getDate());
        var customerRecordId = nlapiSubmitRecord(customerRecord);

        var form = nlapiCreateForm('Thank you for confirming your understanding to invoice the customer - ' + companyName);

        response.writePage(form);

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
