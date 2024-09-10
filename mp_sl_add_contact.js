/**
 * Author:               Ankith Ravindran
 * Created on:           Tue May 23 2023
 * Modified on:          2024-07-09T00:18:39.994Z
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

        //Search Name: Customer List - Status Signed & Lost V3
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
            var accountManager = null;
            var accountManagerId = null;

            var intitial_customer_status = null;

            activeCustomerListSignedSearchResult.forEachResult(function (searchResultActiveCustomerListSigned) {

                custInternalID = searchResultActiveCustomerListSigned.getValue('internalid');
                custEntityID = searchResultActiveCustomerListSigned.getValue('entityid');
                custName = searchResultActiveCustomerListSigned.getValue('companyname');
                partnerId = searchResultActiveCustomerListSigned.getValue('partner');
                intitial_customer_status = searchResultActiveCustomerListSigned.getValue('entitystatus');
                partner_text = searchResultActiveCustomerListSigned.getText('partner');
                accountManager = searchResultActiveCustomerListSigned.getText('custentity_mp_toll_salesrep');
                accountManagerId = searchResultActiveCustomerListSigned.getValue('custentity_mp_toll_salesrep');

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
                } else if (franchiseeSalesRepAssigned == '668711') {
                    salesRepEmail = 'lee.russell@mailplus.com.au';
                    salesRepName = 'Lee Russell';
                    salesRepId = 668711
                } else {
                    salesRepName = accountManager;
                    salesRepId = accountManagerId
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
            } catch (e) {
                log.error({
                    title: 'Error while creating contact',
                    details: e
                })
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
                contactId = nlapiSubmitRecord(contactRecordNew);
            }

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
            attachments.push(nlapiLoadFile(4745107))
            // attachments.push(nlapiLoadFile(5044913))
            // attachments.push(nlapiLoadFile(6000511))

            nlapiLogExecution('DEBUG', 'salesRepId', salesRepId);
            nlapiLogExecution('DEBUG', 'custInternalID', custInternalID);
            nlapiLogExecution('DEBUG', 'email', email);
            nlapiLogExecution('DEBUG', 'custEntityID', custEntityID);
            nlapiLogExecution('DEBUG', 'contactId', contactId);
            nlapiLogExecution('DEBUG', 'intitial_customer_status', intitial_customer_status);

            nlapiSendEmail(salesRepId, email, custEntityID + ' ' + custName + ' - ' + templateSubject, emailHtml, ['portalsupport@mailplus.com.au'], ['ankith.ravindran@mailplus.com.au', 'popie.popie@mailplus.com.au', 'fiona.harrison@mailplus.com.au', 'luke.forbes@mailplus.com.au'], emailAttach, attachments, true);

            var email_body =
                'Please link the USER to the below CUSTOMER details </br></br>';
            email_body += '<u><b>User Details</b></u> </br>';
            email_body += 'First Name: ' + first_name + '</br>';
            email_body += 'Last Name: ' + last_name + '</br>';
            email_body += 'Email: ' + email + '</br>';
            email_body += 'Phone: ' + phone_number + '</br></br>';

            email_body += 'Customer Name: ' + custEntityID + ' ' + custName +
                '</br>';
            email_body += 'Franchisee: ' + partner_text + '</br></br>';

            var email_subject = 'MP Portal - Link User to Customer - ' +
                custEntityID + ' ' + custName;

            var records = new Array();
            records['entity'] = custInternalID;

            //If lead status is "Prospect - Quote Sent" or  "Prospect - Box Sent", status changed to "Customer - Signed" and T&C's accepted. New lead & contact sent to RTA to be synced along with the price points. 
            if (intitial_customer_status == 50 || intitial_customer_status == 72) {

                //Changin lead status & accepting the T&C's
                var customerRecord = nlapiLoadRecord("lead", custInternalID);
                customerRecord.setFieldValue('entitystatus', 13);
                customerRecord.setFieldValue('custentity_terms_conditions_agree', 1);
                customerRecord.setFieldValue('custentity_gift_box_activated', 1);
                customerRecord.setFieldValue('custentity_terms_conditions_agree_date', getDate());
                customerRecord.setFieldValue('custentity_date_prospect_opportunity', getDate());
                custInternalID = nlapiSubmitRecord(customerRecord);

                //Search: Commencement Register List - To Update T&C's Agreed Date
                var commRegUpdateTnCAgreedDateSearch = nlapiLoadSearch('customrecord_commencement_register',
                    'customsearch_comm_reg_upd_tnc_date');

                var filCommReg = [];
                filCommReg[filCommReg.length] = new nlobjSearchFilter('internalid',
                    'custrecord_customer', 'anyof', custInternalID);

                commRegUpdateTnCAgreedDateSearch.addFilters(filCommReg);

                var commRegUpdateTnCAgreedDateSearchResult = commRegUpdateTnCAgreedDateSearch.runSearch();

                commRegUpdateTnCAgreedDateSearchResult.forEachResult(function (searchResult) {

                    var commRegInternalId = searchResult.getValue('internalId');
                    var trialExpiryDate = searchResult.getValue('custrecord_trial_expiry');
                    var commDate = searchResult.getValue('custrecord_comm_date');
                    nlapiLogExecution('DEBUG', 'commRegInternalId', commRegInternalId);

                    if (isNullorEmpty(trialExpiryDate)) {
                        var commRegRecord = nlapiLoadRecord('customrecord_commencement_register', commRegInternalId);
                        commRegRecord.setFieldValue('custrecord_trial_status', 9); // Make the Comm Reg status as Scheduled
                        commRegRecord.setFieldValue('custrecord_tnc_agreement_date', getDateAndTime());
                        var commRegRecordNewInternalId = nlapiSubmitRecord(commRegRecord);
                    } else {
                        const date1 = stringToDate(commDate);
                        const date2 = stringToDate(getDate());
                        if (date1 >= date2) {
                            var commRegRecord = nlapiLoadRecord('customrecord_commencement_register', commRegInternalId);
                            commRegRecord.setFieldValue('custrecord_trial_status', 9); // Make the Comm Reg status as Scheduled
                            commRegRecord.setFieldValue('custrecord_tnc_agreement_date', getDateAndTime());
                            var commRegRecordNewInternalId = nlapiSubmitRecord(commRegRecord);
                        }
                    }

                    nlapiLogExecution('DEBUG', 'comm Reg Update', '');

                    return true;
                });

                //Search Name: Vouchers List - Per Customer
                var voucherListByCustomerSearch = nlapiLoadSearch('customrecord_customer_vouchers', 'customsearch_vouchers_list_per_customer');

                var newFilters = new Array();
                newFilters[0] = new nlobjSearchFilter('internalid', 'custrecord_voucher_customer', 'is', custInternalID);

                voucherListByCustomerSearch.addFilters(newFilters);

                var voucherListByCustomerSearchResult = voucherListByCustomerSearch.runSearch();

                var voucherListByCustomerSearchResultSet = voucherListByCustomerSearchResult.getResults(0, 1);
                if (voucherListByCustomerSearchResultSet.length == 0) {
                    var customerVoucherRecord = nlapiCreateRecord("customrecord_customer_vouchers");
                    customerVoucherRecord.setFieldValue('custrecord_voucher_name', 'PREMIUM50');
                    customerVoucherRecord.setFieldValue('custrecord_voucher_discount_rate', 50);
                    customerVoucherRecord.setFieldValue('custrecord_voucher_customer', custInternalID);
                    customerVoucherRecordInternalId = nlapiSubmitRecord(customerVoucherRecord);
                }



                var customerJSON = '{';
                customerJSON += '"ns_id" : "' + custInternalID + '"'
                customerJSON += '}';

                //Syncing the new lead into RTA system
                var headers = {};
                headers['Content-Type'] = 'application/json';
                headers['Accept'] = 'application/json';
                headers['x-api-key'] = 'XAZkNK8dVs463EtP7WXWhcUQ0z8Xce47XklzpcBj';

                nlapiRequestURL('https://mpns.protechly.com/new_customer', customerJSON,
                    headers);

                //Send email about $50 voucher for MP Premium stock.
                //Template Name: 202408 - $50 Voucher for Premium Packaging
                var emailMerger = nlapiCreateEmailMerger(467);
                var subject = "Your $50 Voucher for Premium Packaging";
                var mergeResult = emailMerger.merge();
                var emailBody = mergeResult.getBody();
                emailBody = emailBody.replace(/nlementityid/gi, custEntityID);
                emailBody = emailBody.replace(/nlemfirstname/gi, first_name);
                emailBody = emailBody.replace(/nlemaccountmanager/gi, first_name);
                var emailAttach = new Object();
                emailAttach['entity'] = custInternalID;

                nlapiSendEmail(112209, email, subject, emailBody,
                    null,
                    null, emailAttach, null, true);

                nlapiLogExecution('DEBUG', 'custInternalID after status to signed', custInternalID);

                var sales_rep_email_body =
                    'New Customer Signed Up</br></br>';

                sales_rep_email_body +=
                    '<u><b>Customer Details</b></u> </br>Customer NS ID: ' +
                    custInternalID + '</br>';
                sales_rep_email_body += 'Customer Name: ' + custEntityID + ' ' + custName +
                    '</br>';
                sales_rep_email_body += 'Franchisee: ' + partner_text + '</br></br>';

                var sales_rep_cust_id_link = 'https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' + custInternalID + '</br></br>';
                sales_rep_email_body += '<u><b>User Details</b></u> </br>';
                sales_rep_email_body += 'First Name: ' + first_name + '</br>';
                sales_rep_email_body += 'Last Name: ' + last_name + '</br>';
                sales_rep_email_body += 'Email: ' + email + '</br>';
                sales_rep_email_body += 'Phone: ' + phone_number + '</br></br>';
                sales_rep_email_body += '<b><u>Customer Link</u></b>: ' + sales_rep_cust_id_link + '</br></br> <b><u>New Auto Signed Up Customer List</u></b>: https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1657&deploy=1&compid=1048144';

                var sales_rep_email_subject = 'Action Required: Activation Kit QR Code Scanned - ' +
                    custEntityID + ' ' + custName;


                var sales_rep_records = new Array();
                sales_rep_records['entity'] = custInternalID;

                if (!isNullorEmpty(salesRepId)) {
                    nlapiSendEmail(112209, salesRepId,
                        sales_rep_email_subject, sales_rep_email_body, ['luke.forbes@mailplus.com.au', 'lee.russell@mailplus.com.au',
                        'ankith.ravindran@mailplus.com.au', 'alexandra.bathman@mailplus.com.au'
                    ], null, sales_rep_records, null, true);
                }

                var email_body_internal =
                    'Please check the below CUSTOMER details </br></br>';
                email_body_internal +=
                    '<u><b>Customer Details</b></u> </br></br>Customer NS ID: ' +
                    custInternalID + '</br>';
                email_body_internal += 'Customer Name: ' + custEntityID + ' ' + custName +
                    '</br>';
                email_body_internal += 'Franchisee: ' + partner_text + '</br></br>';
                nlapiSendEmail(112209, ['fiona.harrison@mailplus.com.au', 'popie.popie@mailplus.com.au'],
                    custEntityID + ' ' + custName + ' - ' + 'Customer Account Created - Please Check & Finalise', email_body_internal, [
                    'ankith.ravindran@mailplus.com.au'
                ], null, records, null, true);

                var params = {
                    custscript_prod_pricing_cust_id: customer_id
                }

                var status = nlapiScheduleScript(
                    'customscript_ss_sync_prod_pricing_mappin', 'customdeploy2', params
                );

                nlapiLogExecution('DEBUG', 'status', status);


            } else if (intitial_customer_status == 13 || intitial_customer_status == 32 || intitial_customer_status == 71 || intitial_customer_status == 66) {
                //If existing customer, adding new contact to the record.

                email_body +=
                    '<u><b>Customer Details</b></u> </br>Existing Customer? YES </br>Customer NS ID: ' +
                    custInternalID + '</br>';

                var sales_rep_email_body =
                    'New Contact added to an existing customer.</br></br>';

                sales_rep_email_body +=
                    '<u><b>Customer Details</b></u> </br>Customer NS ID: ' +
                    custInternalID + '</br>';
                sales_rep_email_body += 'Customer Name: ' + custEntityID + ' ' + custName +
                    '</br>';
                sales_rep_email_body += 'Franchisee: ' + partner_text + '</br></br>';

                var sales_rep_cust_id_link = 'https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' + custInternalID + '</br></br>';
                sales_rep_email_body += '<u><b>User Details</b></u> </br>';
                sales_rep_email_body += 'First Name: ' + first_name + '</br>';
                sales_rep_email_body += 'Last Name: ' + last_name + '</br>';
                sales_rep_email_body += 'Email: ' + email + '</br>';
                sales_rep_email_body += 'Phone: ' + phone_number + '</br></br>';
                sales_rep_email_body += '<b><u>Customer Link</u></b>: ' + sales_rep_cust_id_link + '</br></br> <b><u>New Auto Signed Up Customer List</u></b>: https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1657&deploy=1&compid=1048144';

                var sales_rep_email_subject = 'Action required: New Contact Added - ' +
                    custEntityID + ' ' + custName;

                var sales_rep_records = new Array();
                sales_rep_records['entity'] = custInternalID;

                if (!isNullorEmpty(salesRepId)) {
                    nlapiSendEmail(112209, salesRepId,
                        sales_rep_email_subject, sales_rep_email_body, ['luke.forbes@mailplus.com.au', 'lee.russell@mailplus.com.au',
                        'ankith.ravindran@mailplus.com.au', 'alexandra.bathman@mailplus.com.au'
                    ], null, sales_rep_records, null, true);
                }
            }

            nlapiSendEmail(112209, ['mailplussupport@protechly.com'],
                email_subject, email_body, ['mj@roundtableapps.com',
                'ankith.ravindran@mailplus.com.au'
            ], null, records, null, true);

            nlapiSendEmail(112209, ['portalsupport@mailplus.com.au'],
                email_subject, email_body, null, null, records, null, true);

            //Syncing the new contact with RTA. 
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


function getDateAndTime() {
    var date = new Date();
    if (date.getHours() > 6) {
        date = nlapiAddDays(date, 1);
    }
    date = nlapiDateToString(date, 'datetimetz');
    return date;
}

function stringToDate(str) {
    const [dd, mm, yyyy] = str.split('/');
    return new Date(yyyy, mm - 1, dd);
}