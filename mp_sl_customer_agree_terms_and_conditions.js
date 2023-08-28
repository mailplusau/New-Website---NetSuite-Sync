/**
 * Author:               Ankith Ravindran
 * Created on:           Mon Jan 01 2023
 * Modified on:          Thu Apr 27 2023 12:13:27
 * SuiteScript Version:  Agree to the Terms & Conditions
 * Description:           
 *
 * Copyright (c) 2023 MailPlus Pty. Ltd.
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

function agreeTersmAndConditions(request, response) {
    if (request.getMethod() == "GET") {

        nlapiLogExecution('DEBUG', 'request.getParameter', request);

        var customerRecordId = request.getParameter('custinternalid');
        nlapiLogExecution('DEBUG', 'customerRecordId', customerRecordId);


        var customerRecord = nlapiLoadRecord('customer', customerRecordId);

        var entityId = customerRecord.getFieldValue('entityid');
        var compnayName = customerRecord.getFieldValue('companyname');

        var tncaccepted = customerRecord.getFieldValue('custentity_terms_conditions_agree');

        if (tncaccepted != 1 || tncaccepted != '1') {
            customerRecord.setFieldValue('custentity_terms_conditions_agree_date', getDate());
            customerRecord.setFieldValue('custentity_cust_closed_won', 'T');
            customerRecord.setFieldValue('custentity_date_prospect_opportunity',
                getDate());
            customerRecord.setFieldValue('custentity_terms_conditions_agree', 1);
            var customerRecordId = nlapiSubmitRecord(customerRecord);

            var form = nlapiCreateForm('Thank you for Agreeing to the Terms & Conditions');

            var salesRecordSearch = nlapiLoadSearch('customrecord_sales',
                'customsearch_sales_record_auto_signed__2');

            var filPo = [];
            filPo[filPo.length] = new nlobjSearchFilter('internalid',
                'custrecord_sales_customer', 'anyof', customerRecordId);

            salesRecordSearch.addFilters(filPo);

            var resultSetSalesRecord = salesRecordSearch.runSearch();

            resultSetSalesRecord.forEachResult(function (searchResult) {

                var salesRepEmail = searchResult.getValue('email', 'CUSTRECORD_SALES_ASSIGNED', null);

                var email_body =
                    'Customer has agreed to the Terms & Conditions. </br></br>';
                email_body +=
                    '<u><b>Customer Details</b></u> </br>';
                email_body += 'Customer Name: ' + entityId + ' ' + compnayName +
                    '</br>';

                var email_subject = 'Terms & Conditions Agreed - ' +
                    entityId + ' ' + compnayName;

                var records = new Array();
                records['entity'] = customerRecordId;

                nlapiSendEmail(112209, salesRepEmail,
                    email_subject, email_body, ['luke.forbes@mailplus.com.au', 'fiona.harrison@mailplus.com.au', 'popie.popie@mailplus.com.au'], null, records, null, true);

                return true;
            });
            
        } else {
            var form = nlapiCreateForm('The Terms & Conditions has already been accepted');
        }

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
