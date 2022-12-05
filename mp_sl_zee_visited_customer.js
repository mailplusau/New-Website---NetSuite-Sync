/**
 * @Author: Ankith Ravindran <ankithravindran>
 * @Date:   2021-09-15T17:02:45+10:00
 * @Filename: mp_sl_new_leads_new_website_v2.js
 * @Last modified by:   ankithravindran
 * @Last modified time: 2022-05-24T08:22:37+10:00
 */



/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       14 Jul 2021     Ankith
 *
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

function zeeVisited(request, response) {
    if (request.getMethod() == "GET") {

        nlapiLogExecution('DEBUG', 'request.getParameter', request);

        var customerRecordId = request.getParameter('custinternalid');

        var customerRecord = nlapiLoadRecord('customer', customerRecordId);

        var companyName = customerRecord.getFieldValue('companyname');

        customerRecord.setFieldValue('custentity_mp_toll_zeevisit_memo', getDate());
        customerRecord.setFieldValue('custentity_mp_toll_zeevisit', 'T');
        var customerRecordId = nlapiSubmitRecord(customerRecord);

        var form = nlapiCreateForm('Thank you for contacting/visiting ' + companyName);

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
