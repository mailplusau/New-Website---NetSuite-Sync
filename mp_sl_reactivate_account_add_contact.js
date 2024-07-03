/**
 * Author:               Ankith Ravindran
 * Created on:           Tue May 23 2023
 * Modified on:          Tue May 23 2023 11:40:25
 * SuiteScript Version:  1.0
 * Description:          Add contact based on the info passed from https://mailplus.com.au/authenticate-your-mailplus-account/ webpage. Also create customer portal access for the user and attach the manuals along with the email
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

function addContact(request, response) {
    if (request.getMethod() == "GET") {

        //Retreive data passed from the webpage
        var entityid = request.getParameter('entityid');
        var first_name = request.getParameter('first_name');
        var last_name = request.getParameter('last_name');
        var email = request.getParameter('email');
        var phone_number = request.getParameter('phone_number');

        nlapiLogExecution('DEBUG', "entityid", entityid);
        nlapiLogExecution('DEBUG', "first_name", first_name);
        nlapiLogExecution('DEBUG', "last_name", last_name);
        nlapiLogExecution('DEBUG', "email", email);
        nlapiLogExecution('DEBUG', "phone_number", phone_number);

        //Search Name: Customer List - Status Lost V3
        var activeCustomerListSignedSearch = nlapiLoadSearch('customer', 'customsearch_active_customers_2_2');


        var newFilters = new Array();
        newFilters[0] = new nlobjSearchFilter('entityid', null, 'is', entityid);

        activeCustomerListSignedSearch.addFilters(newFilters);

        var activeCustomerListSignedSearchResult = activeCustomerListSignedSearch.runSearch();

        var activeCustomerListSignedSearchResultSet = activeCustomerListSignedSearchResult.getResults(0, 1);

        if (activeCustomerListSignedSearchResultSet.length != 0) {
            var custInternalID;
            var custEntityID;
            var custName;
            var partner_text;
            var salesRepEmail = null;
            var salesRepName = null;
            var salesRepId = null;

            var intitial_customer_status = null;

            activeCustomerListSignedSearchResult.forEachResult(function (searchResultActiveCustomerListSigned) {

                custInternalID = searchResultActiveCustomerListSigned.getValue('internalid');
                custEntityID = searchResultActiveCustomerListSigned.getValue('entityid');
                custName = searchResultActiveCustomerListSigned.getValue('companyname');
                partnerId = searchResultActiveCustomerListSigned.getValue('partner');
                intitial_customer_status = searchResultActiveCustomerListSigned.getValue('entitystatus');
                partner_text = searchResultActiveCustomerListSigned.getText('partner');

                var franchiseeSalesRepAssigned = nlapiLookupField('customer', parseInt(custInternalID), 'partner.custentity_sales_rep_assigned');
                salesRepId = franchiseeSalesRepAssigned;
                if (franchiseeSalesRepAssigned == '668712') {
                    salesRepEmail = 'belinda.urbani@mailplus.com.au';
                    salesRepName = 'Belinda Urbani';
                    salesRepId = 668712
                } else if (franchiseeSalesRepAssigned == '696160') {
                    salesRepEmail = 'kerina.helliwell@mailplus.com.au'
                    salesRepName = 'Kerina Helliwell';
                    salesRepId = 696160
                } else {
                    salesRepEmail = 'lee.russell@mailplus.com.au';
                    salesRepName = 'Lee Russell';
                    salesRepId = 668711
                }

                return true;
            });

            var contactId;

            var contactRecordNew = nlapiCreateRecord('contact');
            contactRecordNew.setFieldValue('firstname', first_name + ('Reactivate'));
            contactRecordNew.setFieldValue('lastname', last_name);
            contactRecordNew.setFieldValue('email', email);
            contactRecordNew.setFieldValue('phone', phone_number);
            contactRecordNew.setFieldValue('company', custInternalID);

            contactRecordNew.setFieldValue('custentity_connect_admin', 1);
            contactRecordNew.setFieldValue('custentity_connect_user', 1);
            contactRecordNew.setFieldValue('entityid', first_name + ' ' + last_name);
            contactRecordNew.setFieldValue('contactrole', 8);

            contactId = nlapiSubmitRecord(contactRecordNew);

            //Search Name: All Sales Records
            var allSalesRecordSearch = nlapiLoadSearch('customrecord_sales', 'customsearch_all_sales_records_2');

            var newFilters = new Array();
            newFilters[0] = new nlobjSearchFilter('internalid', 'custrecord_sales_customer', 'is', custInternalID);

            allSalesRecordSearch.addFilters(newFilters);

            var salesRecordInternalId = null;

            var allSalesRecordSearchResult = allSalesRecordSearch.runSearch();

            var allSalesRecordSearchResultSet = allSalesRecordSearchResult.getResults(0, 1);

            if (allSalesRecordSearchResultSet.length == 1) {
                salesRecordInternalId = allSalesRecordSearchResultSet[0].getValue("internalid");
            }

            if (!isNullorEmpty(salesRecordInternalId)) {
                var salesRecord = nlapiLoadRecord("customrecord_sales", salesRecordInternalId);
                salesRecord.setFieldValue('custrecord_sales_deactivated', 'T');
                salesRecord.setFieldValue('custrecord_sales_completed', 'T');
                salesRecord.setFieldValue('custrecord_sales_completedate', getDate());
                nlapiSubmitRecord(salesRecord);
            }

            var newSalesRecord = nlapiCreateRecord("customrecord_sales");
            newSalesRecord.setFieldValue('custrecord_sales_customer', custInternalID);
            newSalesRecord.setFieldValue('custrecord_sales_campaign', 77); //MP Premium - Lost EDM
            newSalesRecord.setFieldValue('custrecord_sales_assigned', salesRepId);
            newSalesRecord.setFieldValue('custrecord_sales_outcome', 5);
            newSalesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
            var date = new Date();
            newSalesRecord.setFieldValue('custrecord_sales_callbacktime', nlapiDateToString(date, 'timeofday'));
            nlapiSubmitRecord(newSalesRecord);

            var customerRecord = nlapiLoadRecord("customer", custInternalID);
            customerRecord.setFieldValue('entitystatus', 57);
            nlapiSubmitRecord(customerRecord);

            var emailAttach = new Object();
            emailAttach['entity'] = custInternalID;
            var from = 112209; //MailPlus team
            var subject = 'Sales MP - Premium HOT Lead (Lost Customer to Hot Lead) - ' + custEntityID + ' ' + custName + '';
            var to = salesRepEmail;
            var cc = ['luke.forbes@mailplus.com.au', 'lee.russell@mailplus.com.au',
                'ankith.ravindran@mailplus.com.au'];
            var cust_id_link =
                'https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' +
                custInternalID;
            var body =
                'New sales record has been created. \n A Lost Customer has requested to reactivate their account. \n Customer Name: ' +
                custEntityID + ' ' + custName + '\nLink: ' + cust_id_link;

            if (!isNullorEmpty(salesRepEmail)) {
                nlapiSendEmail(from, to,
                    subject, body, cc, null, emailAttach, null, true);
            }

            nlapiLogExecution('AUDIT', "Contact Added", 'Contact Added');
            var returnObj = {
                success: true,
                message: 'Contact Added',
                result: ''
            };

        } else {
            nlapiLogExecution('AUDIT', "Customer Does Not exist", 'Customer Does Not exist');
            var returnObj = {
                success: false,
                message: 'Customer Does Not exist',
                result: ''
            };


        }
        _sendJSResponse(request, response, returnObj);


    } else {

    }
}

function _sendJSResponse(request, response, respObject) {
    response.setContentType('JAVASCRIPT');
    // response.setHeader('Access-Control-Allow-Origin', '*');
    var callbackFcn = request.getParameter("jsoncallback") || request.getParameter('callback');
    if (callbackFcn) {
        response.writeLine(callbackFcn + "(" + JSON.stringify(respObject) + ");");
    } else response.writeLine(JSON.stringify(respObject));
}
function getDate() {
    var date = new Date();
    if (date.getHours() > 6) {
        date = nlapiAddDays(date, 1);
    }
    date = nlapiDateToString(date);
    return date;
}