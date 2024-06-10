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

        //Search Name: Active Customers - Status Signed V3
        var activeCustomerListSignedSearch = nlapiLoadSearch('customer', 'customsearch_active_customers_2');

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

            activeCustomerListSignedSearchResult.forEachResult(function (searchResultActiveCustomerListSigned) {

                custInternalID = searchResultActiveCustomerListSigned.getValue('internalid');
                custEntityID = searchResultActiveCustomerListSigned.getValue('entityid');
                custName = searchResultActiveCustomerListSigned.getValue('companyname');
                partnerId = searchResultActiveCustomerListSigned.getValue('partner');
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
            contactRecordNew.setFieldValue('firstname', first_name);
            contactRecordNew.setFieldValue('lastname', last_name);
            contactRecordNew.setFieldValue('email', email);
            contactRecordNew.setFieldValue('phone', phone_number);
            contactRecordNew.setFieldValue('company', custInternalID);

            contactRecordNew.setFieldValue('custentity_connect_admin', 1);
            contactRecordNew.setFieldValue('custentity_connect_user', 1);
            contactRecordNew.setFieldValue('entityid', first_name + ' ' + last_name);
            contactRecordNew.setFieldValue('contactrole', 8);

            try {
                contactId = nlapiSubmitRecord(contactRecordNew);

                //Sales Record - Auto Signed Up
                // var salesRecordAutoSigned = nlapiLoadSearch('customrecord_sales', 'customsearch_sales_record_auto_signed__2');

                // var newFilters_addresses = new Array();
                // newFilters_addresses[0] = new nlobjSearchFilter('internalid', 'custrecord_sales_customer', 'is', custInternalID);

                // salesRecordAutoSigned.addFilters(newFilters_addresses);

                // var salesRecordAutoSignedResult = salesRecordAutoSigned.runSearch();

                // var salesRecordAutoSignedResultSet = salesRecordAutoSignedResult.getResults(0, 1);



                // if (salesRecordAutoSignedResultSet.length != 0) {
                //     salesRecordAutoSignedResult.forEachResult(function (searchResult) {

                //         salesRepEmail = searchResult.getValue('email', 'CUSTRECORD_SALES_ASSIGNED', null);
                //         salesRepId = searchResult.getValue('custrecord_sales_assigned');
                //         salesRepName = searchResult.getText('custrecord_sales_assigned');
                //         return true;
                //     });
                // }


                //Send Email to contact about the 
                var url =
                    'https://1048144.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=395&deploy=1&compid=1048144&h=6d4293eecb3cb3f4353e&rectype=customer&template=';
                var template_id = 59;
                var newLeadEmailTemplateRecord = nlapiLoadRecord(
                    'customrecord_camp_comm_template', template_id);
                var templateSubject = newLeadEmailTemplateRecord.getFieldValue(
                    'custrecord_camp_comm_subject');
                var emailAttach = new Object();
                emailAttach['entity'] = custInternalID;

                nlapiLogExecution('DEBUG', 'contactId', contactId);

                url += template_id + '&recid=' + custInternalID + '&salesrep=' +
                    salesRepId + '&dear=' + first_name + '&contactid=' + contactId + '&userid=' +
                    encodeURIComponent(nlapiGetContext().getUser()) + '&salesRepName=' + salesRepName
                urlCall = nlapiRequestURL(url);
                var emailHtml = urlCall.getBody();

                var attachments = [];
                attachments.push(nlapiLoadFile(6977988))
                // attachments.push(nlapiLoadFile(6000512))
                // attachments.push(nlapiLoadFile(5044913))
                // attachments.push(nlapiLoadFile(6000511))

                nlapiLogExecution('DEBUG', 'salesRepId', salesRepId);
                nlapiLogExecution('DEBUG', 'custInternalID', custInternalID);
                nlapiLogExecution('DEBUG', 'email', email);
                nlapiLogExecution('DEBUG', 'custEntityID', custEntityID);
                nlapiLogExecution('DEBUG', 'salesRepEmail', salesRepEmail);
                nlapiLogExecution('DEBUG', 'contactId', contactId);

                nlapiSendEmail(salesRepId, email, custEntityID + ' ' + custName + ' - ' + templateSubject, emailHtml, ['portalsupport@mailplus.com.au', salesRepEmail], ['ankith.ravindran@mailplus.com.au',
                    , 'popie.popie@mailplus.com.au', 'fiona.harrison@mailplus.com.au', 'luke.forbes@mailplus.com.au'], emailAttach, attachments, true);

                var email_body =
                    'Please link the USER to the below CUSTOMER details </br></br>';
                email_body += '<u><b>User Details</b></u> </br>';
                email_body += 'First Name: ' + first_name + '</br>';
                email_body += 'Last Name: ' + last_name + '</br>';
                email_body += 'Email: ' + email + '</br>';
                email_body += 'Phone: ' + phone_number + '</br></br>';
                email_body +=
                    '<u><b>Customer Details</b></u> </br>Existing Customer? YES </br>Customer NS ID: ' +
                    custInternalID + '</br>';
                email_body += 'Customer Name: ' + custEntityID + ' ' + custName +
                    '</br>';
                email_body += 'Franchisee: ' + partner_text + '</br></br>';

                var email_subject = 'MP Portal - Link User to Customer - ' +
                    custEntityID + ' ' + custName;

                var records = new Array();
                records['entity'] = custInternalID;

                // nlapiSendEmail(112209, ['mailplussupport@protechly.com'],
                //     email_subject, email_body, ['mj@roundtableapps.com',
                //     'ankith.ravindran@mailplus.com.au'
                // ], null, records, null, true);

                var userJSON = '{';
                userJSON += '"customer_ns_id" : "' + custInternalID + '",'
                userJSON += '"first_name" : "' + first_name + '",'
                userJSON += '"last_name" : "' + last_name + '",'
                userJSON += '"email" : "' + email + '",'
                userJSON += '"phone" : "' + phone_number + '"'
                userJSON += '}';
                var headers = {};
                headers['Content-Type'] = 'application/json';
                headers['Accept'] = 'application/json';
                headers['x-api-key'] = 'XAZkNK8dVs463EtP7WXWhcUQ0z8Xce47XklzpcBj';

                nlapiRequestURL('https://mpns.protechly.com/new_staff', userJSON,
                    headers);

                nlapiLogExecution('AUDIT', "Contact Added", 'Contact Added');
                var returnObj = {
                    success: true,
                    message: 'Contact Added',
                    result: ''
                };
            } catch (error) {
                nlapiLogExecution('ERROR', "error", error);
                //If Error is thrown while creating a contact, update the contact name by adding "(Portal)" as suffix to the first name. 
                var records = new Array();
                records['entity'] = custInternalID;
                var email_body =
                    'Please check if the below contact has been added </br></br>';
                email_body += '<u><b>User Details</b></u> </br>';
                email_body += 'First Name: ' + first_name + ' (Portal)</br>';
                email_body += 'Last Name: ' + last_name + '</br>';
                email_body += 'Email: ' + email + '</br>';
                email_body += 'Phone: ' + phone_number + '</br></br>';



                nlapiSendEmail(112209, ['ankith.ravindran@mailplus.com.au'],
                    'Activate your business platform - Add Contact Error', email_body, [
                    'popie.popie@mailplus.com.au'
                ], null, records, null, true);

                var returnObj = {
                    success: false,
                    message: 'Contact Already Existing',
                    result: ''
                };

                var contactRecordNew = nlapiCreateRecord('contact');
                contactRecordNew.setFieldValue('firstname', first_name + ' (Portal)');
                contactRecordNew.setFieldValue('lastname', last_name);
                contactRecordNew.setFieldValue('email', email);
                contactRecordNew.setFieldValue('phone', phone_number);
                contactRecordNew.setFieldValue('company', custInternalID);

                contactRecordNew.setFieldValue('custentity_connect_admin', 1);
                contactRecordNew.setFieldValue('custentity_connect_user', 1);
                contactRecordNew.setFieldValue('entityid', first_name + ' ' + last_name);
                contactRecordNew.setFieldValue('contactrole', 8);
                // try {
                contactId = nlapiSubmitRecord(contactRecordNew);

                //Sales Record - Auto Signed Up
                // var salesRecordAutoSigned = nlapiLoadSearch('customrecord_sales', 'customsearch_sales_record_auto_signed__2');

                // var newFilters_addresses = new Array();
                // newFilters_addresses[0] = new nlobjSearchFilter('internalid', 'custrecord_sales_customer', 'is', custInternalID);

                // salesRecordAutoSigned.addFilters(newFilters_addresses);

                // var salesRecordAutoSignedResult = salesRecordAutoSigned.runSearch();

                // var salesRecordAutoSignedResultSet = salesRecordAutoSignedResult.getResults(0, 1);

                // var salesRepEmail = null;
                // var salesRepName = null;

                // if (salesRecordAutoSignedResultSet.length != 0) {
                //     salesRecordAutoSignedResult.forEachResult(function (searchResult) {

                //         salesRepEmail = searchResult.getValue('email', 'CUSTRECORD_SALES_ASSIGNED', null);
                //         salesRepId = searchResult.getValue('custrecord_sales_assigned');
                //         salesRepName = searchResult.getText('custrecord_sales_assigned');
                //         return true;
                //     });
                // }


                //Send Email to contact about the 
                var url =
                    'https://1048144.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=395&deploy=1&compid=1048144&h=6d4293eecb3cb3f4353e&rectype=customer&template=';
                var template_id = 59;
                var newLeadEmailTemplateRecord = nlapiLoadRecord(
                    'customrecord_camp_comm_template', template_id);
                var templateSubject = newLeadEmailTemplateRecord.getFieldValue(
                    'custrecord_camp_comm_subject');
                var emailAttach = new Object();
                emailAttach['entity'] = custInternalID;

                nlapiLogExecution('DEBUG', 'salesRepId', salesRepId);
                nlapiLogExecution('DEBUG', 'custInternalID', custInternalID);
                nlapiLogExecution('DEBUG', 'email', email);
                nlapiLogExecution('DEBUG', 'custEntityID', custEntityID);
                nlapiLogExecution('DEBUG', 'salesRepEmail', salesRepEmail);
                nlapiLogExecution('DEBUG', 'contactId', contactId);

                url += template_id + '&recid=' + custInternalID + '&salesrep=' +
                    salesRepId + '&dear=' + first_name + '&contactid=' + contactId + '&userid=' +
                    encodeURIComponent(nlapiGetContext().getUser()) + '&salesRepName=' + salesRepName
                urlCall = nlapiRequestURL(url);
                var emailHtml = urlCall.getBody();

                var attachments = [];
                attachments.push(nlapiLoadFile(6977988))
                // attachments.push(nlapiLoadFile(6000512))
                // attachments.push(nlapiLoadFile(5044913))
                // attachments.push(nlapiLoadFile(6000511))

                nlapiSendEmail(salesRepId, email, custEntityID + ' ' + custName + ' - ' + templateSubject, emailHtml, ['portalsupport@mailplus.com.au', salesRepEmail], ['ankith.ravindran@mailplus.com.au',
                    'popie.popie@mailplus.com.au', 'fiona.harrison@mailplus.com.au', 'luke.forbes@mailplus.com.au'], emailAttach, attachments, true);

                var email_body =
                    'Please link the USER to the below CUSTOMER details </br></br>';
                email_body += '<u><b>User Details</b></u> </br>';
                email_body += 'First Name: ' + first_name + '</br>';
                email_body += 'Last Name: ' + last_name + '</br>';
                email_body += 'Email: ' + email + '</br>';
                email_body += 'Phone: ' + phone_number + '</br></br>';
                email_body +=
                    '<u><b>Customer Details</b></u> </br>Existing Customer? YES </br>Customer NS ID: ' +
                    custInternalID + '</br>';
                email_body += 'Customer Name: ' + custEntityID + ' ' + custName +
                    '</br>';
                email_body += 'Franchisee: ' + partner_text + '</br></br>';

                var email_subject = 'MP Portal - Link User to Customer - ' +
                    custEntityID + ' ' + custName;

                var records = new Array();
                records['entity'] = custInternalID;

                // nlapiSendEmail(112209, ['mailplussupport@protechly.com'],
                //     email_subject, email_body, ['mj@roundtableapps.com',
                //     'ankith.ravindran@mailplus.com.au'
                // ], null, records, null, true);

                var userJSON = '{';
                userJSON += '"customer_ns_id" : "' + custInternalID + '",'
                userJSON += '"first_name" : "' + first_name + '",'
                userJSON += '"last_name" : "' + last_name + '",'
                userJSON += '"email" : "' + email + '",'
                userJSON += '"phone" : "' + phone_number + '"'
                userJSON += '}';
                var headers = {};
                headers['Content-Type'] = 'application/json';
                headers['Accept'] = 'application/json';
                headers['x-api-key'] = 'XAZkNK8dVs463EtP7WXWhcUQ0z8Xce47XklzpcBj';

                nlapiRequestURL('https://mpns.protechly.com/new_staff', userJSON,
                    headers);


                var returnObj = {
                    success: true,
                    message: 'Contact Added',
                    result: ''
                };
                // } catch (error) {

                // }


            }




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