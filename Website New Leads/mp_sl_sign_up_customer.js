/**
 * @Author: Ankith Ravindran <ankithravindran>
 * @Date:   2021-09-15T17:02:45+10:00
 * @Filename: mp_sl_new_leads_new_website_v2.js
 * @Last modified by:   ankithravindran
 * @Last modified time: 2022-05-24T08:22:37+10:00
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

function leadForm(request, response) {
    if (request.getMethod() == "GET") {

        nlapiLogExecution('DEBUG', 'request.getParameter', request);

        var customerRecordId = request.getParameter('customer_internal_id');
        var contactid = request.getParameter('contactid');
        var abn = request.getParameter('abn');
        var business_name = request.getParameter('business_name');
        var first_name = request.getParameter('first_name');
        var last_name = request.getParameter('last_name');
        var email = request.getParameter('email');
        var phone_number = request.getParameter('phone_number');
        var state = request.getParameter('state');
        var form_salesRep = request.getParameter('salesRep');
        var pageURL = request.getParameter('pageURL');

        nlapiLogExecution('DEBUG', 'customerRecordId', customerRecordId);
        nlapiLogExecution('DEBUG', 'business_name', business_name);
        nlapiLogExecution('DEBUG', 'abn', abn);
        nlapiLogExecution('DEBUG', 'full_name', first_name);
        nlapiLogExecution('DEBUG', 'full_name', last_name);
        nlapiLogExecution('DEBUG', 'email_address', email);
        nlapiLogExecution('DEBUG', 'phone_number', phone_number);
        nlapiLogExecution('DEBUG', 'pageURL', pageURL);
        nlapiLogExecution('DEBUG', 'pageURL', form_salesRep);

        var state_id;

        switch (state) {
            case 'NSW':
                state_id = 1;
                break;
            case 'QLD':
                state_id = 2;
                break;
            case 'VIC':
                state_id = 3;
                break;
            case 'SA':
                state_id = 4;
                break;
            case 'TAS':
                state_id = 5;
                break;
            case 'ACT':
                state_id = 6;
                break;
            case 'WA':
                state_id = 7;
                break;
            case 'NT':
                state_id = 8;
                break;
            case 'NZ':
                state_id = 9;
                break;
        }

        nlapiLogExecution('DEBUG', 'state', state);
        nlapiLogExecution('DEBUG', 'state_id]', state_id);


        var splitPageURL = pageURL.split('https://mailplus.com.au/');

        nlapiLogExecution('DEBUG', 'splitPageURL[0]', splitPageURL[0]);
        nlapiLogExecution('DEBUG', 'splitPageURL[1]', splitPageURL[1]);

        var params = {
            business_name: business_name,
            first_name: first_name,
            last_name: last_name,
            email: email,
            phone_number: phone_number,
            pageURL: pageURL
        };

        //NEW CUSTOMER RECORD
        var dataOut = '{"dataOut":[';

        var zee_id;

        var customerRecord = nlapiLoadRecord('customer', customerRecordId);
        var entity_id = customerRecord.getFieldValue('entityid');

        var intitial_customer_status = customerRecord.getFieldValue('entitystatus');

        var zee_id = customerRecord.getFieldValue('partner');
        var partner_text = customerRecord.getFieldText('partner');

        var partner_id = customerRecord.getFieldValue('partner');

        var partner_record = nlapiLoadRecord('partner', partner_id);
        var mp_std_activated = partner_record.getFieldValue('custentity_zee_mp_std_activated');
        var previous_carrier = customerRecord.getFieldValue('custentity_previous_carrier');
        var zee_email = partner_record.getFieldValue('email');

        var services_of_interest = customerRecord.getFieldValue('custentity_services_of_interest');

        if (intitial_customer_status != 13) {

            nlapiLogExecution('DEBUG', 'services_of_interest', services_of_interest);

            customerRecord.setFieldValue('companyname', business_name);
            customerRecord.setFieldValue('vatregnumber', abn);
            customerRecord.setFieldValue('email', email);
            customerRecord.setFieldValue('custentity_email_service', email);
            customerRecord.setFieldValue('custentity_email_sales', email);
            customerRecord.setFieldValue('phone', phone_number);

            var quadient = business_name.substring(0, 10);
            nlapiLogExecution('DEBUG', 'business_name', business_name);
            if (quadient == 'Quadient -') {
                customerRecord.setFieldValue('leadsource', 246616); //Quadient
            } else {
                customerRecord.setFieldValue('leadsource', 254557); //Inbound - New Website
            }

            customerRecord.setFieldValue('custentity_mpex_customer', 1);
            customerRecord.setFieldValue('custentity_portal_access', 1);
            customerRecord.setFieldValue('custentity_mpex_invoicing_cycle', 2);


            customerRecord.setFieldValue('entitystatus', 66);

            if (mp_std_activated == 1 || mp_std_activated == '1') {
                customerRecord.setFieldValue('custentity_mp_std_activate', 1);
            }

            customerRecord.setFieldValue('custentity_mpex_small_satchel', 1);

            customerRecord.setFieldValue('custentity_cust_closed_won', 'T');

            customerRecord.setFieldValue('custentity_invoice_method', 2);
            customerRecord.setFieldValue('custentity_invoice_by_email', 'T');
            customerRecord.setFieldValue('custentity_auto_sign_up', 'T');
            customerRecord.setFieldValue('custentity_date_prospect_opportunity',
                getDate());

            //Remove all Cancellation details
            customerRecord.setFieldValue('custentity13', null);
            customerRecord.setFieldValue('custentity_service_cancellation_reason',
                null);
            customerRecord.setFieldValue('custentity_date_lead_lost',
                null);


            var finacnial_tab_size = customerRecord.getLineItemCount('itempricing');
            var old_financial_tab_size = finacnial_tab_size;
            var financialTabItemArray = [];

            if (finacnial_tab_size == 0) {

                old_financial_tab_size++;
                customerRecord.setLineItemValue('itempricing', 'item', old_financial_tab_size, 8981);
                customerRecord.setLineItemValue('itempricing', 'level', old_financial_tab_size, -1);
                customerRecord.setLineItemValue('itempricing', 'price', old_financial_tab_size, 0);
            } else {
                // for (var i = 1; i <= customerRecord.getLineItemCount('itempricing'); i++) {
                //     var financialTabItem = customerRecord.getLineItemValue('itempricing', 'item',
                //         i);
                //     financialTabItemArray[financialTabItemArray.length] = financialTabItem;
                // }
            }


            // var params3 = {
            //     custscriptcustomer_id: parseInt(request.getParameter('customer')),
            //     custscriptids: item_ids.toString(),
            //     custscriptlinked_service_ids: null,
            //     custscriptfinancial_tab_array: financial_tab_item_array.toString(),
            //     custscriptfinancial_tab_price_array: financial_tab_price_array.toString()
            // }
            // /**
            //         * Description - Schedule Script to create / edit / delete the financial tab items with the new details
            //         */
            // var status = nlapiScheduleScript(
            //     'customscript_sc_smc_item_pricing_update', 'customdeploy1', params3
            // );
            // if (status == 'QUEUED') {

            //     response.sendRedirect('RECORD', 'customer', parseInt(request.getParameter(
            //         'customer')), false);
            //     return false;
            // }


            var customerRecordId = nlapiSubmitRecord(customerRecord);

            var recContact = nlapiLoadRecord('contact', contactid);
            var contactEmail = recContact.getFieldValue('email');

            if (contactEmail == email) {
                recContact.setFieldValue('firstname', first_name);
                recContact.setFieldValue('lastname', last_name);
                recContact.setFieldValue('email', email);
                recContact.setFieldValue('phone', phone_number);
                contactid = nlapiSubmitRecord(recContact);
            } else {
                var contactRecordNew = nlapiCreateRecord('contact');
                contactRecordNew.setFieldValue('firstname', first_name);
                contactRecordNew.setFieldValue('lastname', last_name);
                contactRecordNew.setFieldValue('email', email);
                contactRecordNew.setFieldValue('phone', phone_number);
                contactRecordNew.setFieldValue('company', customerRecordId);

                contactRecordNew.setFieldValue('custentity_connect_admin', 1);
                contactRecordNew.setFieldValue('custentity_connect_user', 1);
                contactRecordNew.setFieldValue('entityid', first_name + ' ' + last_name);
                contactRecordNew.setFieldValue('contactrole', -10);

                try {
                    contactid = nlapiSubmitRecord(contactRecordNew);
                } catch (error) {
                    var email_body =
                        'New Lead trying to sign up but contact already exists in NetSuite. </br></br>';
                    email_body += '<u><b>Contact Details</b></u> </br>';
                    email_body += 'First Name: ' + first_name + '</br>';
                    email_body += 'Last Name: ' + last_name + '</br>';
                    email_body += 'Email: ' + email + '</br>';
                    email_body += 'Phone: ' + phone_number + '</br></br>';
                    email_body +=
                        '<u><b>Customer Details</b></u> </br>Existing Customer? YES </br>Customer NS ID: ' +
                        customerRecordId + '</br>';
                    email_body += 'Customer Name: ' + entity_id + ' ' + business_name +
                        '</br>';
                    email_body += 'Franchisee: ' + partner_text + '</br></br>';

                    var email_subject = 'Auto Sign Up - Contact Exists - ' +
                        entity_id + ' ' + business_name;

                    var records = new Array();
                    records['entity'] = customerRecordId;

                    nlapiSendEmail(112209, ['laura.busse@mailplus.com.au'],
                        email_subject, email_body, ['popie.popie@mailplus.com.au',
                        'ankith.ravindran@mailplus.com.au', 'fiona.harrison@mailplus.com.au'
                    ], null, records, null, true);
                }

            }



            //Create SALES REP
            var from = 112209; //MailPlus team
            // var to;
            // var cc = ['luke.forbes@mailplus.com.au', 'belinda.urbani@mailplus.com.au',
            //     'ankith.ravindran@mailplus.com.au'
            // ];
            // var subject = 'Sales HOT Lead - ' + entity_id + ' ' + business_name + '';
            // var cust_id_link =
            //     'https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' +
            //     customerRecordId;
            // var body =
            //     'New sales record has been created. \n A HOT Lead has been entered into the System. Please respond in an hour. \n Customer Name: ' +
            //     entity_id + ' ' + business_name + '\nLink: ' + cust_id_link;

            // var postcode = parseInt(postcode);


            // var salesRecord = nlapiCreateRecord('customrecord_sales');
            var salesRep = 112209; //MailPlus team

            // salesRecord.setFieldValue('custrecord_sales_customer',
            //     customerRecordId);
            // salesRecord.setFieldValue('custrecord_sales_campaign', 62); //Field Sales
            // salesRecord.setFieldValue('custrecord_sales_assigned', salesRep);
            // salesRecord.setFieldValue('custrecord_sales_outcome', 5);
            // salesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
            // var date = new Date();
            // salesRecord.setFieldValue('custrecord_sales_callbacktime',
            //     nlapiDateToString(date, 'timeofday'));
            // var sales_record_id = nlapiSubmitRecord(salesRecord);

            var commReg_search = nlapiLoadSearch('customrecord_commencement_register', 'customsearch_service_commreg_assign');

            nlapiLogExecution("DEBUG", "customerRecordId", customerRecordId);
            nlapiLogExecution("DEBUG", "zee_id", zee_id);

            var filterExpression = [
                ["custrecord_customer", "anyof", customerRecordId], // customer id
                "AND", ["custrecord_franchisee", "is", zee_id] // partner id
            ];

            var newFilters = new Array();
            newFilters[0] = new nlobjSearchFilter('custrecord_customer', null, 'anyof', customerRecordId);
            newFilters[1] = new nlobjSearchFilter('custrecord_franchisee', null, 'anyof', zee_id);

            // commReg_search.setFilterExpression(filterExpression);
            commReg_search.addFilters(newFilters);


            var comm_reg_results = commReg_search.runSearch();

            var count_commReg = 0;
            var commRegId = null;

            comm_reg_results.forEachResult(function (searchResult) {
                count_commReg++;

                /**
                 * [if description] - Only the latest comm Reg needs to be assigned
                 */
                if (count_commReg == 1) {
                    commRegId = searchResult.getValue('internalid');
                    customer_comm_reg = nlapiLoadRecord('customrecord_commencement_register', commRegId);
                    customer_comm_reg.setFieldValue('custrecord_trial_status', 9);
                    commRegId = nlapiSubmitRecord(customer_comm_reg);
                }

                /**
                 * [if description] - if more than one Comm Reg, error mail is sent
                 */
                if (count_commReg > 1) {
                    return false;
                }
                return true;
            });

            nlapiLogExecution("DEBUG", "count_commReg", count_commReg);
            nlapiLogExecution("DEBUG", "commRegId", commRegId);

            if (isNullorEmpty(commRegId)) {
                customer_comm_reg = nlapiCreateRecord('customrecord_commencement_register');
                customer_comm_reg.setFieldValue('custrecord_date_entry', getDate());
                customer_comm_reg.setFieldValue('custrecord_comm_date', getDate());
                customer_comm_reg.setFieldValue('custrecord_comm_date_signup', getDate());
                customer_comm_reg.setFieldValue('custrecord_customer', customerRecordId);
                customer_comm_reg.setFieldValue('custrecord_salesrep', salesRep);
                customer_comm_reg.setFieldValue('custrecord_franchisee', zee_id);
                customer_comm_reg.setFieldValue('custrecord_wkly_svcs', '5');
                customer_comm_reg.setFieldValue('custrecord_in_out', 1);
                customer_comm_reg.setFieldValue('custrecord_trial_status', 9);
                customer_comm_reg.setFieldValue('custrecord_state', state_id);
                customer_comm_reg.setFieldValue('custrecord_sale_type', 1);
                customer_comm_reg.setFieldValue('custrecord_finalised_by', 112209);
                customer_comm_reg.setFieldValue('custrecord_finalised_on', getDate());
                // customer_comm_reg.setFieldValue('custrecord_commreg_sales_record',
                //     sales_record_id);

                commRegId = nlapiSubmitRecord(customer_comm_reg);
            }




            var phonecall = nlapiCreateRecord('phonecall');
            phonecall.setFieldValue('assigned', zee_id);
            phonecall.setFieldValue('custevent_organiser', 112209);
            phonecall.setFieldValue('startdate', getDate());
            phonecall.setFieldValue('company', customerRecordId);
            phonecall.setFieldValue('status', 'COMPLETE');
            phonecall.setFieldValue('custevent_call_outcome', 16);
            phonecall.setFieldValue('title', 'Sales - Digital Lead Campaign - Signed');
            nlapiSubmitRecord(phonecall);

            var freqArray = [];
            freqArray[freqArray.length] = 6;


            var new_service_record = nlapiCreateRecord('customrecord_service', {
                recordmode: 'dynamic'
            });
            new_service_record.setFieldValue('custrecord_service', 24);
            new_service_record.setFieldValue('name', 'MPEX Pickup');
            new_service_record.setFieldValue('custrecord_service_price', 0);
            new_service_record.setFieldValue('custrecord_service_customer', customerRecordId);
            new_service_record.setFieldValue('custrecord_service_comm_reg', commRegId);

            new_service_record.setFieldValue('custrecord_service_day_adhoc', 'T');

            var new_service_id = nlapiSubmitRecord(new_service_record);

            var new_service_change_record = nlapiCreateRecord('customrecord_servicechg');
            new_service_change_record.setFieldValue('custrecord_servicechg_date_effective', getDate());
            new_service_change_record.setFieldValue('custrecord_servicechg_service', new_service_id);
            new_service_change_record.setFieldValue('custrecord_servicechg_status', 2);
            new_service_change_record.setFieldValue('custrecord_servicechg_old_zee', zee_id);
            new_service_change_record.setFieldValue('custrecord_servicechg_new_price', 0);
            new_service_change_record.setFieldValue('custrecord_servicechg_comm_reg', commRegId);
            new_service_change_record.setFieldValues('custrecord_servicechg_new_freq', freqArray);
            new_service_change_record.setFieldValue('custrecord_servicechg_created', 112209);
            new_service_change_record.setFieldValue('custrecord_servicechg_type', 'New Customer');
            new_service_change_record.setFieldValue('custrecord_default_servicechg_record', 1);
            nlapiSubmitRecord(new_service_change_record);
        }

        dataOut += '{"ns_id":"' + customerRecordId + '"},';

        dataOut = dataOut.substring(0, dataOut.length - 1);
        dataOut += ']}';
        nlapiLogExecution('DEBUG', 'dataOut', dataOut);

        var returnObj = {
            success: true,
            message: '',
            result: dataOut
        };

        _sendJSResponse(request, response, returnObj);

        var customerJSON = '{';
        customerJSON += '"ns_id" : "' + customerRecordId + '"'
        customerJSON += '}';

        var headers = {};
        headers['Content-Type'] = 'application/json';
        headers['Accept'] = 'application/json';
        headers['x-api-key'] = 'XAZkNK8dVs463EtP7WXWhcUQ0z8Xce47XklzpcBj';

        nlapiRequestURL('https://mpns.protechly.com/new_customer', customerJSON,
            headers);

        var email_body =
            'Please link the USER to the below CUSTOMER details </br></br>';
        email_body += '<u><b>User Details</b></u> </br>';
        email_body += 'First Name: ' + first_name + '</br>';
        email_body += 'Last Name: ' + last_name + '</br>';
        email_body += 'Email: ' + email + '</br>';
        email_body += 'Phone: ' + phone_number + '</br></br>';
        email_body +=
            '<u><b>Customer Details</b></u> </br>Existing Customer? YES </br>Customer NS ID: ' +
            customerRecordId + '</br>';
        email_body += 'Customer Name: ' + entity_id + ' ' + business_name +
            '</br>';
        email_body += 'Franchisee: ' + partner_text + '</br></br>';

        var email_subject = 'MP Portal - Link User to Customer - ' +
            entity_id + ' ' + business_name;

        var records = new Array();
        records['entity'] = customerRecordId;

        // nlapiSendEmail(112209, ['mailplussupport@protechly.com'],
        //     email_subject, email_body, ['mj@roundtableapps.com',
        //     'ankith.ravindran@mailplus.com.au'
        // ], null, records, null, true);

        var userJSON = '{';
        userJSON += '"customer_ns_id" : "' + customerRecordId + '",'
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

        //Sales Record - Auto Signed Up
        var salesRecordAutoSigned = nlapiLoadSearch('customrecord_sales', 'customsearch_sales_record_auto_signed__2');

        var newFilters_addresses = new Array();
        newFilters_addresses[0] = new nlobjSearchFilter('internalid', 'custrecord_sales_customer', 'is', customerRecordId);

        salesRecordAutoSigned.addFilters(newFilters_addresses);

        var salesRecordAutoSignedResult = salesRecordAutoSigned.runSearch();

        var salesRecordAutoSignedResultSet = salesRecordAutoSignedResult.getResults(0, 1);

        var salesRepEmail = null;
        var salesRepName = null;

        if (salesRecordAutoSignedResultSet.length != 0) {
            salesRecordAutoSignedResult.forEachResult(function (searchResult) {

                salesRepEmail = searchResult.getValue('email', 'CUSTRECORD_SALES_ASSIGNED', null);
                salesRepId = searchResult.getValue('custrecord_sales_assigned');
                salesRepName = searchResult.getText('custrecord_sales_assigned');
                return true;
            });
        }


        //Send Email to Customer who filled out the Landing Page Form
        var url =
            'https://1048144.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=395&deploy=1&compid=1048144&ns-at=AAEJ7tMQgAVHkxJsbXgGwQQm4xn968o7JJ9-Ym7oanOzCSkWO78&rectype=customer&template=';
        var template_id = 59;
        var newLeadEmailTemplateRecord = nlapiLoadRecord(
            'customrecord_camp_comm_template', template_id);
        var templateSubject = newLeadEmailTemplateRecord.getFieldValue(
            'custrecord_camp_comm_subject');
        var emailAttach = new Object();
        emailAttach['entity'] = customerRecordId;

        nlapiLogExecution('DEBUG', 'customerRecordId', customerRecordId)
        nlapiLogExecution('DEBUG', 'salesRep', salesRep)
        nlapiLogExecution('DEBUG', 'first_name', first_name)
        nlapiLogExecution('DEBUG', 'contactid', contactid)
        nlapiLogExecution('DEBUG', 'salesRepName', salesRepName)

        url += template_id + '&recid=' + customerRecordId + '&salesrep=' +
            salesRep + '&dear=' + first_name + '&contactid=' + contactid + '&userid=' +
            encodeURIComponent(nlapiGetContext().getUser()) + '&salesRepName=' + salesRepName
        urlCall = nlapiRequestURL(url);
        var emailHtml = urlCall.getBody();

        var attachments = [];
        attachments.push(nlapiLoadFile(6977988))
        // attachments.push(nlapiLoadFile(6000512))
        // attachments.push(nlapiLoadFile(5044913))
        // attachments.push(nlapiLoadFile(6000511))

        nlapiSendEmail(salesRepId, email, entity_id + ' ' + business_name + ' - ' + templateSubject, emailHtml, ['portalsupport@mailplus.com.au',
            'customerservice@mailplus.com.au', salesRepEmail], ['ankith.ravindran@mailplus.com.au',
            'popie.popie@mailplus.com.au', 'fiona.harrison@mailplus.com.au', 'luke.forbes@mailplus.com.au'], emailAttach, attachments, true);


        if (intitial_customer_status != 13) {
            var sales_rep_email_body =
                'New Customer Signed Up</br></br>';
            // sales_rep_email_body += '<u><b>User Details</b></u> </br>';
            // sales_rep_email_body += 'First Name: ' + first_name + '</br>';
            // sales_rep_email_body += 'Last Name: ' + last_name + '</br>';
            // sales_rep_email_body += 'Email: ' + email + '</br>';
            // sales_rep_email_body += 'Phone: ' + phone_number + '</br></br>';
            sales_rep_email_body +=
                '<u><b>Customer Details</b></u> </br>Customer NS ID: ' +
                customerRecordId + '</br>';
            sales_rep_email_body += 'Customer Name: ' + entity_id + ' ' + business_name +
                '</br>';
            sales_rep_email_body += 'Franchisee: ' + partner_text + '</br></br>';
            var sales_rep_cust_id_link = 'https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' + customerRecordId;
            sales_rep_email_body += '<b><u>Customer Link</u></b>: ' + sales_rep_cust_id_link + '</br></br> <b><u>New Auto Signed Up Customer List</u></b>: https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1657&deploy=1&compid=1048144';

            var sales_rep_email_subject = 'Action required: New Customer Signed Up - ' +
                entity_id + ' ' + business_name;


            var sales_rep_records = new Array();
            sales_rep_records['entity'] = customerRecordId;

            if (!isNullorEmpty(salesRepEmail)) {
                nlapiSendEmail(112209, salesRepEmail,
                    sales_rep_email_subject, sales_rep_email_body, ['luke.forbes@mailplus.com.au', 'lee.russell@mailplus.com.au',
                    'ankith.ravindran@mailplus.com.au'
                ], null, sales_rep_records, null, true);
            }

            var email_body_internal =
                'Please check the below CUSTOMER details </br></br>';
            email_body_internal +=
                '<u><b>Customer Details</b></u> </br></br>Customer NS ID: ' +
                customerRecordId + '</br>';
            email_body_internal += 'Customer Name: ' + entity_id + ' ' + business_name +
                '</br>';
            email_body_internal += 'Franchisee: ' + partner_text + '</br></br>';
            nlapiSendEmail(112209, ['fiona.harrison@mailplus.com.au', 'popie.popie@mailplus.com.au'],
                entity_id + ' ' + business_name + ' - ' + 'Customer Account Created - Please Check & Finalise', email_body_internal, [
                'ankith.ravindran@mailplus.com.au'
            ], null, records, null, true);




        }

        //Send Email to franchisee about new customer
        // var url =
        //     'https://1048144.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=395&deploy=1&compid=1048144&ns-at=AAEJ7tMQgAVHkxJsbXgGwQQm4xn968o7JJ9-Ym7oanOzCSkWO78&rectype=customer&template=';
        // var template_id = 150;
        // var newLeadEmailTemplateRecord = nlapiLoadRecord(
        //     'customrecord_camp_comm_template', template_id);
        // var templateSubject = newLeadEmailTemplateRecord.getFieldValue(
        //     'custrecord_camp_comm_subject');
        // var emailAttach = new Object();
        // emailAttach['entity'] = partner_id;


        // url += template_id + '&recid=' + customerRecordId + '&salesrep=' +
        //     salesRep + '&dear=' + first_name + '&contactid=' + contactid + '&userid=' +
        //     encodeURIComponent(nlapiGetContext().getUser());;
        // urlCall = nlapiRequestURL(url);
        // var emailHtml = urlCall.getBody();



        // nlapiSendEmail(112209, zee_email, templateSubject, emailHtml, ['michael.mcdaid@mailplus.com.au',
        //     'greg.hart@mailplus.com.au'], ['ankith.ravindran@mailplus.com.au',
        //     'laura.busse@mailplus.com.au', 'popie.popie@mailplus.com.au', 'fiona.harrison@mailplus.com.au'], emailAttach, null, true);

        if (services_of_interest == 8 && !isNullorEmpty(form_salesRep)) {



            var from = 112209; //MailPlus team
            var to;
            var cc = ['luke.forbes@mailplus.com.au', 'lee.russell@mailplus.com.au',
                'ankith.ravindran@mailplus.com.au'
            ];
            var subject = 'Sales HOT Lead Auto Signed Up - ' + entity_id + ' ' + business_name + '';
            var cust_id_link =
                'https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' +
                customerRecordId;
            var body =
                'This lead has Signed Up via the website. \n\n Lead Interested in both Products & Services.\n Customer has got access to the portal and has received rates for the products. \n\n Customer Name: ' +
                entity_id + ' ' + business_name + '\n\nCustomer Link: ' + cust_id_link + '\n\n Auto Signed Up List - Services & Products: https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1661&deploy=1';

            nlapiLogExecution('DEBUG', 'salesRepEmail', salesRepEmail);
            if (!isNullorEmpty(salesRepEmail)) {
                nlapiSendEmail(from, salesRepEmail, subject, body, cc);
            }

        }

        if ((mp_std_activated != 1 && mp_std_activated != '1') || (previous_carrier == 3 || previous_carrier == 7 || previous_carrier == 5)) {
            var status = nlapiScheduleScript(
                'customscript_ss_exp_prod_sync_map', 'customdeploy2', null
            );
            nlapiLogExecution('DEBUG', 'status', status);
        } else if (mp_std_activated == 1 || mp_std_activated == '1') {
            var params = {
                custscript_prod_pricing_cust_id: customerRecordId
            }
            var status = nlapiScheduleScript(
                'customscript_ss_sync_prod_pricing_mappin', 'customdeploy2', params
            );
            nlapiLogExecution('DEBUG', 'status', status);
        }
    }

}

function _sendJSResponse(request, response, respObject) {
    response.setContentType('JAVASCRIPT');
    // response.setHeader('Access-Control-Allow-Origin', '*');
    var callbackFcn = request.getParameter("jsoncallback") || request.getParameter(
        'callback');
    if (callbackFcn) {
        response.writeLine(callbackFcn + "(" + JSON.stringify(respObject) + ");");
    } else response.writeLine(JSON.stringify(respObject));
}

function formatStateName(stateName) {
    stateName = stateName.toLowerCase();
    nlapiLogExecution('DEBUG', 'stateName', stateName);
    switch (stateName) {
        case 'new south wales':
            stateName = 'nsw';
            break;
        case 'victoria':
            stateName = 'vic';
            break;
        case 'queensland':
            stateName = 'qld';
            break;
        case 'northern territory':
            stateName = 'nt';
            break;
        case 'south australia':
            stateName = 'sa';
            break;
        case 'western australia':
            stateName = 'wa';
            break;
        case 'australian capital territory':
            stateName = 'act';
            break;
        case 'tasmania':
            stateName = 'tas';
            break;
    }
    return stateName.toUpperCase();
}

function geocodeAddress(address) {
    var position;
    var geocode = new google.maps.Geocoder();
    geocoder.geocode({
        'address': address
    }, function (results, status) {
        if (status === 'OK') {
            position = results[0].geometry.location;
        } else {
            alert('Geocode was not successful for the following reason: ' +
                status);
        }
    });
    return position
}

function getTerritory(lat, lng) {
    var territory = [];
    var file = nlapiLoadFile(3772482);
    var data = file.getValue();
    nlapiLogExecution('DEBUG', 'data', data);
    data = JSON.parse(data);
    nlapiLogExecution('DEBUG', 'data', data);
    var territories = data.features;
    for (k = 0; k < territories.length; k++) {
        var polygon_array = territories[k].geometry.coordinates;
        var polygon = [];
        if (polygon_array.length > 1) {
            for (i = 0; i < polygon_array.length; i++) {
                polygon = polygon.concat(polygon_array[i][0]);
            }
        } else {
            polygon = polygon_array[0];
        }
        nlapiLogExecution('DEBUG', 'polygon' + territories[k].properties.Territory + '',
            polygon);
        nlapiLogExecution('DEBUG', 'polygon.length' + territories[k].properties.Territory +
            '', polygon.length);
        var isInTerritory = inside([lng, lat], polygon);
        nlapiLogExecution('DEBUG', 'isInTerritory' + territories[k].properties.Territory +
            '', isInTerritory);
        if (isInTerritory == true) {
            territory[territory.length] = territories[k].properties.Territory;
            nlapiLogExecution('DEBUG', 'territories[k].properties.Territory', territories[k].properties.Territory);
            nlapiLogExecution('DEBUG', 'territory', territory);
            break;
        }
    }
    return territory;
}

function inside(point, polygon) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point[0],
        y = point[1];
    var inside = false;
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        var xi = polygon[i][0],
            yi = polygon[i][1];
        var xj = polygon[j][0],
            yj = polygon[j][1];

        var intersect = ((yi > y) != (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};

function getDate() {
    var date = new Date();
    if (date.getHours() > 6) {
        date = nlapiAddDays(date, 1);
    }
    date = nlapiDateToString(date);
    return date;
}
