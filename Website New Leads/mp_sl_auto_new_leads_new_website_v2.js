/**
 * Author:               Ankith Ravindran
 * Created on:           Thu Nov 24 2022
 * Modified on:         `Thu May 11 2023 08:15:43
 * SuiteScript Version:  1.0 
 * Description:          Suitelet to create a new lead in Netsuite from the information got from the website form.  
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

function leadForm(request, response) {
    if (request.getMethod() == "GET") {

        nlapiLogExecution('DEBUG', 'request.getParameter', request);

        var parent_lpo = request.getParameter('parent_lpo');
        var business_name = request.getParameter('business_name');
        var first_name = request.getParameter('first_name');
        var last_name = request.getParameter('last_name');
        var email = request.getParameter('email');
        var phone_number = request.getParameter('phone_number');
        var address1 = request.getParameter('address1');
        var address2 = request.getParameter('address2');
        var city = request.getParameter('city');
        var state = request.getParameter('state');
        var postcode = request.getParameter('postcode');
        var lat = request.getParameter('lat');
        var lng = request.getParameter('lng');
        var avg_daily_shipments = request.getParameter('avg_daily_shipments');
        var services_of_interest = request.getParameter('services_of_interest');
        var pageURL = request.getParameter('pageURL');
        var how_did_you_hear_about_us = request.getParameter(
            'how_did_you_hear_about_us');
        var current_carrier = request.getParameter(
            'current_carrier');
        var subscribe = request.getParameter('subscribe');
        var lpo_notes = request.getParameter('lpo_notes');

        var lpoLeadProfileSalesRep = null;


        nlapiLogExecution('DEBUG', 'parent_lpo', parent_lpo);
        nlapiLogExecution('DEBUG', 'business_name', business_name);
        nlapiLogExecution('DEBUG', 'full_name', first_name);
        nlapiLogExecution('DEBUG', 'full_name', last_name);
        nlapiLogExecution('DEBUG', 'email_address', email);
        nlapiLogExecution('DEBUG', 'phone_number', phone_number);
        nlapiLogExecution('DEBUG', 'address1', address1);
        nlapiLogExecution('DEBUG', 'address2', address2);
        nlapiLogExecution('DEBUG', 'city', city);
        nlapiLogExecution('DEBUG', 'state', state);
        nlapiLogExecution('DEBUG', 'postcode', postcode);
        nlapiLogExecution('DEBUG', 'lat', lat);
        nlapiLogExecution('DEBUG', 'lng', lng);
        nlapiLogExecution('DEBUG', 'avg_daily_shipments', avg_daily_shipments);
        nlapiLogExecution('DEBUG', 'pageURL', pageURL);

        var avg_daily_shipments_text;
        var services_of_interest_text;
        var how_did_you_hear_about_us_text;
        var current_carrier_text;

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



        var splitPageURL = pageURL.split('https://mailplus.com.au/');

        nlapiLogExecution('DEBUG', 'splitPageURL[0]', splitPageURL[0]);
        nlapiLogExecution('DEBUG', 'splitPageURL[1]', splitPageURL[1]);

        var params = {
            parent_lpo: parent_lpo,
            business_name: business_name,
            first_name: first_name,
            last_name: last_name,
            email: email,
            phone_number: phone_number,
            address1: address1,
            address2: address2,
            city: city,
            state: state,
            postcode: postcode,
            avg_daily_shipments: avg_daily_shipments,
            services_of_interest: services_of_interest,
            pageURL: pageURL
        };

        //NEW CUSTOMER RECORD
        var dataOut = '{"dataOut":[';

        //If Post code is empty, do not create a record on NetSuite
        if (isNullorEmpty(postcode)) {
            dataOut += '{"ns_id":"ADDRESS ERROR - Empty Post Code"},';
        } else {

            var zee_id;
            var zeeCount = 0;

            //Network Matrix - Franchisee - Auto Allocate
            var zeeNetworkMatrixSearch = nlapiLoadSearch('partner', 'customsearch_networkmtrx_zee_suburb_2');

            var filterExpression = [
                ["entityid", "doesnotstartwith", "old"],
                "AND",
                ["entityid", "doesnotstartwith", "test"],
                "AND",
                ["custentity_network_matrix_json", "contains", city],
                "AND",
                ["custentity_network_matrix_json", "contains", state],
                "AND",
                ["custentity_network_matrix_json", "contains", postcode]
            ];

            nlapiLogExecution('DEBUG', 'filterExpression', filterExpression);

            zeeNetworkMatrixSearch.setFilterExpression(filterExpression);

            var zeeNetworkMatrixSearchResults = zeeNetworkMatrixSearch.runSearch();

            var zee_name = '';

            zeeNetworkMatrixSearchResults.forEachResult(function (searchResult) {

                zee_id = searchResult.getValue('internalid');
                if (zeeCount == 0) {
                    zee_name += searchResult.getValue('companyname');
                } else {
                    zee_name += ', ' + searchResult.getValue('companyname');
                }


                nlapiLogExecution('DEBUG', 'zee_id|count:' + zeeCount, zee_id);


                zeeCount++;
                return true;
            });

            nlapiLogExecution('DEBUG', 'zeeCount', zeeCount);
            nlapiLogExecution('DEBUG', 'zee_id', zee_id);

            var customerRecord = nlapiCreateRecord('lead');
            if (!isNullorEmpty(parent_lpo)) {
                customerRecord.setFieldValue('custentity_lpo_parent_account', parent_lpo);

                //Search Name: LPO Lead Profiles - List
                var resultSetlpoProfileLeadsListSearch = nlapiLoadSearch('customrecord_lpo_lead_form', 'customsearch_lpo_lead_profiles_list');

                var newFiltersLPOProfileLead = new Array();
                newFiltersLPOProfileLead[newFiltersLPOProfileLead.length] = new nlobjSearchFilter(
                    'custrecord_lpo_lead_customer', null, 'is', parent_lpo);
                resultSetlpoProfileLeadsListSearch.addFilters(newFiltersLPOProfileLead);

                var resultSetlpoProfileLeadsListSearch = resultSetlpoProfileLeadsListSearch.runSearch();
                resultSetlpoProfileLeadsListSearch.forEachResult(function (lpoProfileLeadsListSearchResultSet) {

                    var lpoLeadProfileParentCustomer = lpoProfileLeadsListSearchResultSet.getValue('custrecord_lpo_lead_customer');
                    lpoLeadProfileSalesRep = lpoProfileLeadsListSearchResultSet.getValue('custrecord_lpo_sales_rep');

                    return true;
                });
            }
            customerRecord.setFieldValue('companyname', business_name);
            customerRecord.setFieldValue('email', email);
            customerRecord.setFieldValue('custentity_email_service', email);
            customerRecord.setFieldValue('custentity_email_sales', email);
            customerRecord.setFieldValue('phone', phone_number);

            var quadient = business_name.substring(0, 10);
            nlapiLogExecution('DEBUG', 'business_name', business_name);
            if (quadient == 'Quadient -') {
                customerRecord.setFieldValue('leadsource', 246616); //Quadient
            } else if (pageURL == 'https://mailplus.com.au/lpo-lead-generation/') {
                customerRecord.setFieldValue('leadsource', 282085); //LPO - Inbound Web
                customerRecord.setFieldValue('custentity_lpo_notes', 282085); //LPO - Notes
            } else if (pageURL == 'https://mailplus.com.au/lpo-partnership/') {
                customerRecord.setFieldValue('leadsource', 282083); //LPO - AP Customer
            } else {
                if (how_did_you_hear_about_us == '9') {
                    customerRecord.setFieldValue('leadsource', 280411); //FuturePlus
                } else {
                    customerRecord.setFieldValue('leadsource', 254557); //Inbound - New Website
                }

            }


            customerRecord.setFieldValue('entitystatus', 57); //Suspect - Hot Lead

            customerRecord.setFieldValue('custentity_hotleads', 'T');

            customerRecord.setFieldValue('custentity_industry_category', 19); //Other services
            customerRecord.setFieldValue('custentity_date_lead_entered', getDate());
            customerRecord.setFieldValue('custentity_lead_entered_by', 585236); //Portal

            if (how_did_you_hear_about_us == '9') {
                customerRecord.setFieldValue('custentity_how_did_you_hear_about_us', 9);
                how_did_you_hear_about_us_text = 'FuturePlus';
            } else if (pageURL == 'https://mailplus.com.au/lpo-lead-generation/' || pageURL == 'https://mailplus.com.au/lpo-partnership/') {
                // customerRecord.setFieldValue('custentity_how_did_you_hear_about_us', 9);
                how_did_you_hear_about_us_text = '';
            } else {
                customerRecord.setFieldValue('custentity_how_did_you_hear_about_us', 1);
                how_did_you_hear_about_us_text = 'Social Media (e.g. Facebook)';
            }

            customerRecord.setFieldValue('custentity_mpex_customer', 1);
            customerRecord.setFieldValue('custentity_portal_access', 1);


            if (avg_daily_shipments == '1') {
                customerRecord.setFieldValue('custentity_form_mpex_usage_per_week', 1);
                avg_daily_shipments_text = '1 - 20 per Week';
            } else if (avg_daily_shipments == '2') {
                customerRecord.setFieldValue('custentity_form_mpex_usage_per_week', 2);
                avg_daily_shipments_text = '21 - 100 per Week';
            } else if (avg_daily_shipments == '3') {
                customerRecord.setFieldValue('custentity_form_mpex_usage_per_week', 3);
                avg_daily_shipments_text = '100+ per Week';
            }

            if (splitPageURL[1] == '10-off-first-invoice/') {
                customerRecord.setFieldValue('custentity_pop_up_discount', 1);
            }

            customerRecord.setFieldValue('custentity_mpex_invoicing_cycle', 2);


            if (isNullorEmpty(zee_id) || zeeCount > 1) {

                if ((pageURL == 'https://mailplus.com.au/lpo-lead-generation/' || pageURL == 'https://mailplus.com.au/lpo-partnership/') && zee_id != 713275) {
                    customerRecord.setFieldValue('custentity_lpo_account_status', 2); //LPO Account Status: Inactive
                    customerRecord.setFieldValue('custentity_date_lpo_validated', getDate()); //LPO Account Status: Inactive
                    customerRecord.setFieldValue('entitystatus', 68); //Suspect - Validated
                }
                customerRecord.setFieldValue('partner', 435);//MailPlus Pty Ltd

                //Send Email to Laura/Fiona/Popie to confirm if the lead can be services by a franchisee or not

            } else if (!isNullorEmpty(zee_id) && zeeCount == 1) {
                //Create suspect in NetSuite
                //Assign lead to franchisee
                //create sales record
                //Send sign up email to customer

                if (isNullorEmpty(parent_lpo) && pageURL == 'https://mailplus.com.au/lpo-partnership/') {
                    //Search Name: LPO Lead Profiles - List
                    var resultSetlpoProfileLeadsListSearch = nlapiLoadSearch('customrecord_lpo_lead_form', 'customsearch_lpo_lead_profiles_list');

                    var newFiltersLPOProfileLead = new Array();
                    newFiltersLPOProfileLead[newFiltersLPOProfileLead.length] = new nlobjSearchFilter(
                        'custentity_lpo_linked_franchisees', 'custrecord_lpo_lead_customer', 'anyof', zee_id);
                    resultSetlpoProfileLeadsListSearch.addFilters(newFiltersLPOProfileLead);

                    var resultSetlpoProfileLeadsListSearch = resultSetlpoProfileLeadsListSearch.runSearch();
                    var lpoLeadProfileParentCustomer = null;
                    resultSetlpoProfileLeadsListSearch.forEachResult(function (lpoProfileLeadsListSearchResultSet) {

                        lpoLeadProfileParentCustomer = lpoProfileLeadsListSearchResultSet.getValue('custrecord_lpo_lead_customer');
                        lpoLeadProfileSalesRep = lpoProfileLeadsListSearchResultSet.getValue('custrecord_lpo_sales_rep');

                        return true;
                    });

                    customerRecord.setFieldValue('custentity_lpo_parent_account', lpoLeadProfileParentCustomer);
                }

                var serviceFuelSurchargeToBeApplied = 0;
                var partner_record;
                if (!isNullorEmpty(zee_id) && zeeCount == 1) {
                    partnerRecord = nlapiLoadRecord('partner', zee_id);
                    serviceFuelSurchargeToBeApplied = partnerRecord.getFieldValue(
                        'custentity_service_fuel_surcharge_apply');
                }

                customerRecord.setFieldValue('partner', zee_id);

                if ((pageURL == 'https://mailplus.com.au/lpo-lead-generation/' || pageURL == 'https://mailplus.com.au/lpo-partnership/') && zee_id != 713275) {
                    customerRecord.setFieldValue('custentity_lpo_account_status', 2); //LPO Account Status: Inactive
                    customerRecord.setFieldValue('custentity_date_lpo_validated', getDate()); //LPO Account Status: Inactive
                    customerRecord.setFieldValue('entitystatus', 68); //Suspect - Validated
                }

                if (serviceFuelSurchargeToBeApplied == 1 ||
                    serviceFuelSurchargeToBeApplied == '1') {
                    customerRecord.setFieldValue('custentity_service_fuel_surcharge', 1);
                    customerRecord.setFieldValue('custentity_service_fuel_surcharge_percen',
                        '24.30');

                }
            }

            customerRecord.setFieldValue('custentity_website_page_url', pageURL);

            customerRecord.setFieldValue('custentity_mpex_surcharge_rate', '18.44');
            customerRecord.setFieldValue('custentity_mpex_surcharge', 1);
            customerRecord.setFieldValue('custentity_sendle_fuel_surcharge', '8.60');

            if (services_of_interest == '7') {
                customerRecord.setFieldValue('custentity_services_of_interest', 7);
                service_of_interest_text = 'Parcel & satchel delivery';
            } else if (services_of_interest == '2') {
                customerRecord.setFieldValue('custentity_services_of_interest', 2);
                service_of_interest_text = 'Australia Post collect & lodge service';
            } else if (services_of_interest == '8') {
                customerRecord.setFieldValue('custentity_services_of_interest', 8);
                service_of_interest_text = 'Parcel & satchel delivery | Australia Post collect & lodge service';
            }

            if (current_carrier == '6') {
                customerRecord.setFieldValue('custentity_previous_carrier', 6);
                current_carrier_text = 'Australia Post';
            } else if (current_carrier == '3') {
                customerRecord.setFieldValue('custentity_previous_carrier', 3);
                current_carrier_text = 'Courier Please';
            } else if (current_carrier == '7') {
                customerRecord.setFieldValue('custentity_previous_carrier', 7);
                current_carrier_text = 'Aramex';
            } else if (current_carrier == '5') {
                customerRecord.setFieldValue('custentity_previous_carrier', 5);
                current_carrier_text = 'Sendle';
            } else if (current_carrier == '8') {
                customerRecord.setFieldValue('custentity_previous_carrier', 8);
                current_carrier_text = 'Mix';
            }

            //ADDRESS
            customerRecord.selectNewLineItem('addressbook');
            customerRecord.setCurrentLineItemValue('addressbook', 'label',
                'Site Address');
            customerRecord.setCurrentLineItemValue('addressbook', 'country', 'AU');
            customerRecord.setCurrentLineItemValue('addressbook', 'zip', postcode);
            customerRecord.setCurrentLineItemValue('addressbook', 'addr1', address1);
            customerRecord.setCurrentLineItemValue('addressbook', 'addr2', address2);
            customerRecord.setCurrentLineItemValue('addressbook', 'addressee', business_name);
            customerRecord.setCurrentLineItemValue('addressbook', 'city', city);
            customerRecord.setCurrentLineItemValue('addressbook', 'state', state);
            customerRecord.setCurrentLineItemValue('addressbook', 'defaultshipping', 'T');
            customerRecord.setCurrentLineItemValue('addressbook', 'defaultbilling', 'T');
            // customerRecord.setCurrentLineItemValue('custrecord_address_lat', lat);
            // customerRecord.setCurrentLineItemValue('custrecord_address_lon', lng);
            customerRecord.commitLineItem('addressbook');

            var customerRecordId = nlapiSubmitRecord(customerRecord);

            //Create CONTACT
            var contactRecord = nlapiCreateRecord('contact');
            contactRecord.setFieldValue('firstname', first_name);
            contactRecord.setFieldValue('lastname', last_name);
            contactRecord.setFieldValue('email', email);
            contactRecord.setFieldValue('phone', phone_number);
            contactRecord.setFieldValue('company', customerRecordId);

            contactRecord.setFieldValue('custentity_connect_admin', 1);
            contactRecord.setFieldValue('custentity_connect_user', 1);
            contactRecord.setFieldValue('entityid', first_name + ' ' + last_name);
            contactRecord.setFieldValue('contactrole', -10);
            if (subscribe == 'true') {
                contactRecord.setFieldValue('custentity_subscribe_list', 1);
            }
            var contactId = nlapiSubmitRecord(contactRecord);


            var customer_record = nlapiLoadRecord('customer', customerRecordId, {
                recordmode: 'dynamic'
            });
            var entity_id = customer_record.getFieldValue('entityid');
            var customer_name = customer_record.getFieldValue('companyname');
            var usage_per_week = customer_record.getFieldText(
                'custentity_form_mpex_usage_per_week');
            var hear_about_us = customer_record.getFieldText(
                'custentity_how_did_you_hear_about_us');
            var interests = customer_record.getFieldText(
                'custentity_services_of_interest');
            var previous_carrier = customer_record.getFieldText(
                'custentity_previous_carrier');

            if (!isNullorEmpty(zee_id) && zeeCount == 1) {
                if (services_of_interest != '2') {
                    //Prospect - Quote Sent
                    // customer_record.setFieldValue('entitystatus', 50);
                    // customer_record.setFieldValue('custentity_date_lead_quote_sent',
                    //     getDate());
                }
                // var customerRecordId = nlapiSubmitRecord(customer_record);
            }

            customer_record.selectLineItem('addressbook', 1);
            var subrecord = customer_record.editCurrentLineItemSubrecord('addressbook', 'addressbookaddress');
            subrecord.setFieldValue('custrecord_address_lat', lat);
            subrecord.setFieldValue('custrecord_address_lon', lng);
            subrecord.commit();
            customer_record.commitLineItem('addressbook');
            nlapiSubmitRecord(customer_record);


            var note_value = '';
            note_value += 'Average Daily Shipment: ' + usage_per_week + '/\n';
            note_value += 'How did you hear about us: ' + hear_about_us + '/\n';
            note_value += 'Service of Interest: ' + interests + '/\n';
            note_value += 'Current Carrier: ' + previous_carrier + '/\n';

            var userNoteRecord = nlapiCreateRecord('note');
            userNoteRecord.setFieldValue('title', 'New Lead');
            userNoteRecord.setFieldValue('entity', customerRecordId);

            // userNoteRecord.setFieldValue('direction', $('#direction option:selected').val());
            // userNoteRecord.setFieldValue('notetype', $('#notetype option:selected').val());
            userNoteRecord.setFieldValue('note', note_value);
            userNoteRecord.setFieldValue('author', nlapiGetUser());
            userNoteRecord.setFieldValue('notedate', getDate());

            nlapiSubmitRecord(userNoteRecord);



            //Create SALES REP


            var postcode = parseInt(postcode);

            var salesRep = 112209;

            if (isNullorEmpty(zee_id) || zeeCount > 1) {

                var emailAttach = new Object();
                emailAttach['entity'] = customerRecordId;

                var from = 112209; //MailPlus team
                var to;
                if (pageURL == 'https://mailplus.com.au/lpo-partnership/') {
                    var cc = ['luke.forbes@mailplus.com.au', 'lee.russell@mailplus.com.au',
                        'ankith.ravindran@mailplus.com.au', 'alexandra.bathman@mailplus.com.au']
                } else {
                    var cc = ['luke.forbes@mailplus.com.au', 'lee.russell@mailplus.com.au',
                        'ankith.ravindran@mailplus.com.au']
                }

                if (pageURL == 'https://mailplus.com.au/lpo-partnership/') {
                    var subject = 'Sales LPO - AP Customer HOT Lead - ' + entity_id + ' ' + customer_name + '';
                } else if (pageURL == 'https://mailplus.com.au/lpo-lead-generation/') {
                    var subject = 'Sales LPO Generated HOT Lead - ' + entity_id + ' ' + customer_name + '';
                } else {
                    var subject = 'Sales HOT Lead - ' + entity_id + ' ' + customer_name + '';
                }

                var cust_id_link =
                    'https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' +
                    customerRecordId;
                var body =
                    'New sales record has been created. \n A HOT Lead has been entered into the System. Please respond in an hour. \n Customer Name: ' +
                    entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;

                if (!isNullorEmpty(lpoLeadProfileSalesRep)) {
                    to = lpoLeadProfileSalesRep;
                    body =
                        'Hi, \n \nA HOT Lead has been entered into the System.\n Customer Name: ' +
                        entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;
                    var salesRecord = nlapiCreateRecord('customrecord_sales');
                    var salesRep = lpoLeadProfileSalesRep;

                    salesRecord.setFieldValue('custrecord_sales_customer',
                        customerRecordId);
                    if (pageURL == 'https://mailplus.com.au/lpo-lead-generation/' || pageURL == 'https://mailplus.com.au/lpo-partnership/') {
                        salesRecord.setFieldValue('custrecord_sales_campaign', 69); //LPO
                    }

                    salesRecord.setFieldValue('custrecord_sales_assigned', lpoLeadProfileSalesRep);
                    salesRecord.setFieldValue('custrecord_sales_outcome', 5);
                    salesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
                    var date = new Date();
                    salesRecord.setFieldValue('custrecord_sales_callbacktime',
                        nlapiDateToString(date, 'timeofday'));
                    nlapiSubmitRecord(salesRecord);

                    nlapiSendEmail(from, to, subject, body, cc, null, emailAttach);
                } else {
                    if (pageURL == 'https://mailplus.com.au/lpo-lead-generation/' || pageURL == 'https://mailplus.com.au/lpo-partnership/') {
                        to = ['paul.mcintosh@mailplus.com.au', 'alison.savona@mailplus.com.au'];
                        body =
                            'Hi, \n \nA HOT Lead has been entered into the System.\n The HOT Lead has not been assciated to an LPO or a franchisee.\n Customer Name: ' +
                            entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;
                        var salesRecord = nlapiCreateRecord('customrecord_sales');
                        var salesRep = 653718;

                        salesRecord.setFieldValue('custrecord_sales_customer',
                            customerRecordId);
                        if (pageURL == 'https://mailplus.com.au/lpo-lead-generation/' || pageURL == 'https://mailplus.com.au/lpo-partnership/') {
                            salesRecord.setFieldValue('custrecord_sales_campaign', 69); //LPO
                        }

                        salesRecord.setFieldValue('custrecord_sales_assigned', 653718);
                        salesRecord.setFieldValue('custrecord_sales_outcome', 5);
                        salesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
                        var date = new Date();
                        salesRecord.setFieldValue('custrecord_sales_callbacktime',
                            nlapiDateToString(date, 'timeofday'));
                        nlapiSubmitRecord(salesRecord);

                        nlapiSendEmail(from, to, subject, body, cc, null, emailAttach);
                    } else {
                        if (postcode >= 2000 && postcode <= 2999) {
                            //ACT & NSW Postcodes
                            var postcode = parseInt(postcode);
                            //Byron Bay Postcodes
                            if (postcode == 2481 || postcode == 2482 || postcode == 2485 ||
                                postcode == 2486 || postcode == 2487 || postcode == 2488 || postcode ==
                                2479) {
                                to = ['lee.russell@mailplus.com.au'];
                                body =
                                    'Hi Lee, \n \nA HOT Lead has been entered into the System.\n Customer Name: ' +
                                    entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;
                                var salesRecord = nlapiCreateRecord('customrecord_sales');
                                var salesRep = 668711; //Lee Russell

                                salesRecord.setFieldValue('custrecord_sales_customer',
                                    customerRecordId);
                                if (pageURL == 'https://mailplus.com.au/lpo-lead-generation/' || pageURL == 'https://mailplus.com.au/lpo-partnership/') {
                                    salesRecord.setFieldValue('custrecord_sales_campaign', 69); //LPO
                                } else {
                                    salesRecord.setFieldValue('custrecord_sales_campaign', 67); //Website Leads - Auto Sign Up
                                }

                                salesRecord.setFieldValue('custrecord_sales_assigned', 668711);
                                salesRecord.setFieldValue('custrecord_sales_outcome', 5);
                                salesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
                                var date = new Date();
                                salesRecord.setFieldValue('custrecord_sales_callbacktime',
                                    nlapiDateToString(date, 'timeofday'));
                                nlapiSubmitRecord(salesRecord);
                            } else if (postcode == 2481) { //Albury
                                var salesRep = 668712; //Belinda Urbani
                                to = ['belinda.urbani@mailplus.com.au'];;
                                body =
                                    'Hi Belinda, \n \nA HOT Lead has been entered into the System.\n Customer Name: ' +
                                    entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;
                                var salesRecord = nlapiCreateRecord('customrecord_sales');

                                salesRecord.setFieldValue('custrecord_sales_customer',
                                    customerRecordId);
                                if (pageURL == 'https://mailplus.com.au/lpo-lead-generation/' || pageURL == 'https://mailplus.com.au/lpo-partnership/') {
                                    salesRecord.setFieldValue('custrecord_sales_campaign', 69); //LPO
                                } else {
                                    salesRecord.setFieldValue('custrecord_sales_campaign', 67); //Website Leads - Auto Sign Up
                                }
                                salesRecord.setFieldValue('custrecord_sales_assigned', salesRep);
                                salesRecord.setFieldValue('custrecord_sales_outcome', 5);
                                salesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
                                var date = new Date();
                                salesRecord.setFieldValue('custrecord_sales_callbacktime',
                                    nlapiDateToString(date, 'timeofday'));
                                nlapiSubmitRecord(salesRecord);
                            } else {
                                //ACT Post Codes
                                var salesRecord = nlapiCreateRecord('customrecord_sales');
                                var salesRep = 696160; //Kerina Helliwell
                                to = ['kerina.helliwell@mailplus.com.au'];

                                salesRecord.setFieldValue('custrecord_sales_customer',
                                    customerRecordId);
                                if (pageURL == 'https://mailplus.com.au/lpo-lead-generation/' || pageURL == 'https://mailplus.com.au/lpo-partnership/') {
                                    salesRecord.setFieldValue('custrecord_sales_campaign', 69); //LPO
                                } else {
                                    salesRecord.setFieldValue('custrecord_sales_campaign', 67); //Website Leads - Auto Sign Up
                                }
                                salesRecord.setFieldValue('custrecord_sales_assigned', salesRep);
                                salesRecord.setFieldValue('custrecord_sales_outcome', 5);
                                salesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
                                var date = new Date();
                                salesRecord.setFieldValue('custrecord_sales_callbacktime',
                                    nlapiDateToString(date, 'timeofday'));
                                nlapiSubmitRecord(salesRecord);

                            }

                        } else { //Everything else

                            //Create Sales Record
                            var salesRecord = nlapiCreateRecord('customrecord_sales');
                            if ((postcode >= 3000 && postcode <= 3999) || (postcode >= 7000 && postcode <= 7999)) { //VIC & SA & TAS Postcodes
                                var salesRep = 668712; //Belinda Urbani
                                to = ['belinda.urbani@mailplus.com.au'];
                            } else if ((postcode >= 5000 &&
                                postcode <= 5999)) {
                                var salesRep = 668712; //Belinda Urbani
                                to = ['belinda.urbani@mailplus.com.au'];
                            } else if ((postcode >= 4000 && postcode <= 4999) || (postcode >= 800 &&
                                postcode <= 999) || (postcode >= 6000 && postcode <= 6999)) { //QLD & NT & WA Postcodes
                                var salesRep = 668711; //Lee Russell
                                to = ['lee.russell@mailplus.com.au']
                            } else { //Everything else
                                var salesRep = 668712; //Belinda Urbani
                                to = ['belinda.urbani@mailplus.com.au'];
                            }

                            salesRecord.setFieldValue('custrecord_sales_customer', customerRecordId);
                            if (pageURL == 'https://mailplus.com.au/lpo-lead-generation/' || pageURL == 'https://mailplus.com.au/lpo-partnership/') {
                                salesRecord.setFieldValue('custrecord_sales_campaign', 69); //LPO
                            } else {
                                salesRecord.setFieldValue('custrecord_sales_campaign', 67); //Website Leads - Auto Sign Up
                            }
                            salesRecord.setFieldValue('custrecord_sales_assigned', salesRep);
                            salesRecord.setFieldValue('custrecord_sales_outcome', 5);
                            salesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
                            var date = new Date();
                            salesRecord.setFieldValue('custrecord_sales_callbacktime',
                                nlapiDateToString(date, 'timeofday'));
                            nlapiSubmitRecord(salesRecord);
                        }
                    }

                }


                if (pageURL == 'https://mailplus.com.au/lpo-lead-generation/') {
                    body += '\n ' + lpo_notes;
                }
                nlapiSendEmail(from, to, subject, body, cc, null, emailAttach);

                if (isNullorEmpty(zee_id)) {
                    var from = 112209; //MailPlus team
                    // var to = ['laura.busse@mailplus.com.au'];
                    // var cc = ['fiona.harrison@mailplus.com.au', 'popie.popie@mailplus.com.au',
                    //     'ankith.ravindran@mailplus.com.au'
                    // ];
                    // var subject = 'Check Service Territory - ' + entity_id + ' ' + customer_name + '';
                    // var cust_id_link =
                    //     'https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' +
                    //     customerRecordId;
                    // var body =
                    //     'New sales lead has been created in NetSuite. \n Please validate if the lead can be serviced by a franchisee. \n\n No suburb mapping available for the address entered by the lead \n\n Customer Name: ' +
                    //     entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;

                    // nlapiSendEmail(from, to, subject, body, cc);
                } else if (zeeCount > 1) {
                    // var from = 112209; //MailPlus team
                    // var to = ['laura.busse@mailplus.com.au'];
                    // var cc = ['fiona.harrison@mailplus.com.au', 'popie.popie@mailplus.com.au',
                    //     'ankith.ravindran@mailplus.com.au'
                    // ];
                    // var subject = 'Check Service Territory - ' + entity_id + ' ' + customer_name + '';
                    // var cust_id_link =
                    //     'https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' +
                    //     customerRecordId;
                    // var body =
                    //     'New sales lead has been created in NetSuite. \n Please validate if the lead can be serviced by a franchisee. \n\n The address entered by the lead can be service by ' + zee_name + ' franchisees. Please check the maps and either assign to correct franchisee or send it to the Sales Team. \n Customer Name: ' +
                    //     entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;

                    // nlapiSendEmail(from, to, subject, body, cc);
                }


            } else if (!isNullorEmpty(zee_id) && zeeCount == 1) {
                var emailAttach = new Object();
                emailAttach['entity'] = customerRecordId;
                var from = 112209; //MailPlus team
                var to;
                if (pageURL == 'https://mailplus.com.au/lpo-partnership/') {
                    var cc = ['luke.forbes@mailplus.com.au', 'lee.russell@mailplus.com.au',
                        'ankith.ravindran@mailplus.com.au', 'alexandra.bathman@mailplus.com.au']
                } else {
                    var cc = ['luke.forbes@mailplus.com.au', 'lee.russell@mailplus.com.au',
                        'ankith.ravindran@mailplus.com.au']
                }

                if (pageURL == 'https://mailplus.com.au/lpo-partnership/' && zee_id != 713275) {
                    var subject = 'Sales LPO - AP Customer HOT Lead - ' + entity_id + ' ' + customer_name + '';
                } else if (pageURL == 'https://mailplus.com.au/lpo-lead-generation/') {
                    var subject = 'Sales LPO Generated HOT Lead - ' + entity_id + ' ' + customer_name + '';
                } else {
                    var subject = 'Sales HOT Lead - ' + entity_id + ' ' + customer_name + '';
                }
                var cust_id_link =
                    'https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' +
                    customerRecordId;
                var body =
                    'New sales record has been created. \n A HOT Lead has been entered into the System. Please respond in an hour. \n Customer Name: ' +
                    entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;

                if (!isNullorEmpty(lpoLeadProfileSalesRep)) {
                    to = lpoLeadProfileSalesRep;
                    body =
                        'Hi, \n \nA HOT Lead has been entered into the System.\n Customer Name: ' +
                        entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;
                    var salesRecord = nlapiCreateRecord('customrecord_sales');
                    var salesRep = lpoLeadProfileSalesRep;

                    salesRecord.setFieldValue('custrecord_sales_customer',
                        customerRecordId);
                    if (pageURL == 'https://mailplus.com.au/lpo-lead-generation/' || pageURL == 'https://mailplus.com.au/lpo-partnership/') {
                        salesRecord.setFieldValue('custrecord_sales_campaign', 69); //LPO
                    }

                    salesRecord.setFieldValue('custrecord_sales_assigned', lpoLeadProfileSalesRep);
                    salesRecord.setFieldValue('custrecord_sales_outcome', 5);
                    salesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
                    var date = new Date();
                    salesRecord.setFieldValue('custrecord_sales_callbacktime',
                        nlapiDateToString(date, 'timeofday'));
                    nlapiSubmitRecord(salesRecord);
                } else {
                    if (pageURL == 'https://mailplus.com.au/lpo-lead-generation/' || pageURL == 'https://mailplus.com.au/lpo-partnership/') {
                        to = ['paul.mcintosh@mailplus.com.au', 'alison.savona@mailplus.com.au'];
                        body =
                            'Hi, \n \nA HOT Lead has been entered into the System.\n The HOT Lead has not been assciated to an LPO or a franchisee.\n Customer Name: ' +
                            entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;
                        var salesRecord = nlapiCreateRecord('customrecord_sales');
                        var salesRep = lpoLeadProfileSalesRep;

                        salesRecord.setFieldValue('custrecord_sales_customer',
                            customerRecordId);
                        if (pageURL == 'https://mailplus.com.au/lpo-lead-generation/' || pageURL == 'https://mailplus.com.au/lpo-partnership/') {
                            salesRecord.setFieldValue('custrecord_sales_campaign', 69); //LPO
                        }

                        salesRecord.setFieldValue('custrecord_sales_assigned', lpoLeadProfileSalesRep);
                        salesRecord.setFieldValue('custrecord_sales_outcome', 5);
                        salesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
                        var date = new Date();
                        salesRecord.setFieldValue('custrecord_sales_callbacktime',
                            nlapiDateToString(date, 'timeofday'));
                        nlapiSubmitRecord(salesRecord);

                        nlapiSendEmail(from, to, subject, body, cc, null, emailAttach);
                    } else {
                        if (postcode >= 2000 && postcode <= 2999) {
                            //ACT & NSW Postcodes
                            var postcode = parseInt(postcode);
                            //Byron Bay Postcodes
                            if (postcode == 2481 || postcode == 2482 || postcode == 2485 ||
                                postcode == 2486 || postcode == 2487 || postcode == 2488 || postcode ==
                                2479) {
                                to = ['lee.russell@mailplus.com.au'];
                                body =
                                    'Hi Lee, \n \nA HOT Lead has been entered into the System.\n Customer Name: ' +
                                    entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;
                                var salesRecord = nlapiCreateRecord('customrecord_sales');
                                var salesRep = 668711; //Lee Russell

                                salesRecord.setFieldValue('custrecord_sales_customer',
                                    customerRecordId);
                                if ((pageURL == 'https://mailplus.com.au/lpo-lead-generation/' || pageURL == 'https://mailplus.com.au/lpo-partnership/') && zee_id != 713275) {
                                    salesRecord.setFieldValue('custrecord_sales_campaign', 69); //LPO
                                } else {
                                    salesRecord.setFieldValue('custrecord_sales_campaign', 67); //Website Leads - Auto Sign Up
                                }
                                salesRecord.setFieldValue('custrecord_sales_assigned', 668711);
                                salesRecord.setFieldValue('custrecord_sales_outcome', 5);
                                salesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
                                var date = new Date();
                                salesRecord.setFieldValue('custrecord_sales_callbacktime',
                                    nlapiDateToString(date, 'timeofday'));
                                nlapiSubmitRecord(salesRecord);
                            } else if (postcode == 2481) { //Albury
                                var salesRep = 668712; //Belinda Urbani
                                to = ['belinda.urbani@mailplus.com.au'];
                                body =
                                    'Hi Belinda, \n \nA HOT Lead has been entered into the System.\n Customer Name: ' +
                                    entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;
                                var salesRecord = nlapiCreateRecord('customrecord_sales');

                                salesRecord.setFieldValue('custrecord_sales_customer',
                                    customerRecordId);
                                if ((pageURL == 'https://mailplus.com.au/lpo-lead-generation/' || pageURL == 'https://mailplus.com.au/lpo-partnership/') && zee_id != 713275) {
                                    salesRecord.setFieldValue('custrecord_sales_campaign', 69); //LPO
                                } else {
                                    salesRecord.setFieldValue('custrecord_sales_campaign', 67); //Website Leads - Auto Sign Up
                                }
                                salesRecord.setFieldValue('custrecord_sales_assigned', salesRep);
                                salesRecord.setFieldValue('custrecord_sales_outcome', 5);
                                salesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
                                var date = new Date();
                                salesRecord.setFieldValue('custrecord_sales_callbacktime',
                                    nlapiDateToString(date, 'timeofday'));
                                nlapiSubmitRecord(salesRecord);
                            } else {
                                //ACT Post Codes
                                var salesRecord = nlapiCreateRecord('customrecord_sales');
                                var salesRep = 696160; //Kerina Helliwell
                                to = ['kerina.helliwell@mailplus.com.au'];

                                salesRecord.setFieldValue('custrecord_sales_customer',
                                    customerRecordId);
                                if ((pageURL == 'https://mailplus.com.au/lpo-lead-generation/' || pageURL == 'https://mailplus.com.au/lpo-partnership/') && zee_id != 713275) {
                                    salesRecord.setFieldValue('custrecord_sales_campaign', 69); //LPO
                                } else {
                                    salesRecord.setFieldValue('custrecord_sales_campaign', 67); //Website Leads - Auto Sign Up
                                }
                                salesRecord.setFieldValue('custrecord_sales_assigned', salesRep);
                                salesRecord.setFieldValue('custrecord_sales_outcome', 5);
                                salesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
                                var date = new Date();
                                salesRecord.setFieldValue('custrecord_sales_callbacktime',
                                    nlapiDateToString(date, 'timeofday'));
                                nlapiSubmitRecord(salesRecord);

                            }

                        } else { //Everything else

                            //Create Sales Record
                            var salesRecord = nlapiCreateRecord('customrecord_sales');
                            if ((postcode >= 3000 && postcode <= 3999) || (postcode >= 7000 && postcode <= 7999)) { //VIC & SA & TAS Postcodes
                                var salesRep = 668712; //Belinda Urbani
                                to = ['belinda.urbani@mailplus.com.au'];
                            } else if ((postcode >= 5000 &&
                                postcode <= 5999)) {
                                var salesRep = 668712; //Belinda Urbani
                                to = ['belinda.urbani@mailplus.com.au'];
                            } else if ((postcode >= 4000 && postcode <= 4999) || (postcode >= 800 &&
                                postcode <= 999) || (postcode >= 6000 && postcode <= 6999)) { //QLD & NT & WA Postcodes
                                var salesRep = 668711; //Lee Russell
                                to = ['lee.russell@mailplus.com.au']
                            } else { //Everything else
                                var salesRep = 668712; //Belinda Urbani
                                to = ['belinda.urbani@mailplus.com.au'];
                            }

                            salesRecord.setFieldValue('custrecord_sales_customer', customerRecordId);
                            if ((pageURL == 'https://mailplus.com.au/lpo-lead-generation/' || pageURL == 'https://mailplus.com.au/lpo-partnership/') && zee_id != 713275) {
                                salesRecord.setFieldValue('custrecord_sales_campaign', 69); //LPO
                            } else {
                                salesRecord.setFieldValue('custrecord_sales_campaign', 67); //Website Leads - Auto Sign Up
                            }
                            salesRecord.setFieldValue('custrecord_sales_assigned', salesRep);
                            salesRecord.setFieldValue('custrecord_sales_outcome', 5);
                            salesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
                            var date = new Date();
                            salesRecord.setFieldValue('custrecord_sales_callbacktime',
                                nlapiDateToString(date, 'timeofday'));
                            nlapiSubmitRecord(salesRecord);
                        }
                    }
                }


                // if (services_of_interest == '2' || services_of_interest == '8') {
                if (pageURL == 'https://mailplus.com.au/lpo-lead-generation/') {
                    body += '\n ' + lpo_notes;
                }
                nlapiSendEmail(from, to, subject, body, cc, null, emailAttach);

                // }
            }

            var customer_record = nlapiLoadRecord('customer', customerRecordId);
            customer_record.setFieldValue('custentity_mp_toll_salesrep', salesRep);
            var customerRecordId = nlapiSubmitRecord(customer_record);

            if (pageURL == 'https://mailplus.com.au/lpo-lead-generation/') {
                var phonecall = nlapiCreateRecord('phonecall');
                phonecall.setFieldValue('title', 'LPO - Inbound Web - Notes');
                phonecall.setFieldValue('company', customerRecordId);
                phonecall.setFieldValue('assigned', nlapiGetUser());
                phonecall.setFieldValue('custevent_organiser', 112209);
                phonecall.setFieldValue('startdate', getDate());
                phonecall.setFieldValue('custevent_call_type', 2);
                phonecall.setFieldValue('assigned', salesRep);
                phonecall.setFieldValue('message', lpo_notes);
                phonecall.setFieldValue('custevent_call_type', 1);
                phonecall.setFieldText('status', 'Confirmed');
                nlapiSubmitRecord(phonecall);
            }

            //
            var sendleZoneIDSearch = nlapiLoadSearch('customrecord_dom_zones', 'customsearch_sendle_dom_zones');

            var newFiltersZoneID = new Array();
            newFiltersZoneID[newFiltersZoneID.length] = new nlobjSearchFilter(
                'custrecord_dom_zones_postcode', null, 'is', postcode.toString());
            newFiltersZoneID[newFiltersZoneID.length] = new nlobjSearchFilter(
                'custrecord_dom_zones_suburb_name', null, 'is', city);

            sendleZoneIDSearch.addFilters(newFiltersZoneID);

            var sendleZoneIDSearchResult = sendleZoneIDSearch.runSearch();

            nlapiLogExecution('DEBUG', 'sendleZoneIDSearchResult.length', sendleZoneIDSearchResult.length);

            var nsZoneID = 4;
            sendleZoneIDSearchResult.forEachResult(function (sendleZoneIDSearchResultSet) {

                nsZoneID = sendleZoneIDSearchResultSet.getValue('custrecord_dom_zones_ns_zones');
                nlapiLogExecution('DEBUG', 'inside zone search', nsZoneID);
                return true;
            });

            nlapiLogExecution('DEBUG', 'nsZoneID', nsZoneID);

            /*
            5Kg	    1
            3Kg	    2
            1Kg	    3
            500g	4
            B4	    5
            10Kg	8
            25Kg	9
            250g	10
            25kg    11
            */

            var std250gGoldItemPricingSearch = nlapiLoadSearch('noninventoryitem', 'customsearch3745');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_carrier', null, 'anyof', 5);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_product_weight', null, 'anyof', 10);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_item_zones', null, 'anyof', nsZoneID);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_item_receiver_zones', null, 'anyof', 1);
            if (avg_daily_shipments == 1 || avg_daily_shipments == 2) {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 13);
            } else {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 14);
            }
            std250gGoldItemPricingSearch.addFilters(newFilters);

            nlapiLogExecution('DEBUG', 'newFilters', newFilters);


            var std250gGoldItemPricingSearchResult = std250gGoldItemPricingSearch.runSearch();

            nlapiLogExecution('DEBUG', 'std250gGoldItemPricingSearchResult', std250gGoldItemPricingSearchResult);

            var itemInternalstd250gID = null;
            std250gGoldItemPricingSearchResult.forEachResult(function (std250gGoldItemPricingSearchResultSet) {
                itemInternalstd250gID = std250gGoldItemPricingSearchResultSet.getValue('internalid');

                return true;
            });

            var std500gGoldItemPricingSearch = nlapiLoadSearch('noninventoryitem', 'customsearch3745');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_carrier', null, 'anyof', 5);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_product_weight', null, 'anyof', 4);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_item_zones', null, 'anyof', nsZoneID);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_item_receiver_zones', null, 'anyof', 1);
            if (avg_daily_shipments == 1 || avg_daily_shipments == 2) {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 13);
            } else {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 14);
            }
            std500gGoldItemPricingSearch.addFilters(newFilters);

            var std500gGoldItemPricingSearchResult = std500gGoldItemPricingSearch.runSearch();

            var itemInternalstd500gID = null;
            std500gGoldItemPricingSearchResult.forEachResult(function (std500gGoldItemPricingSearchResultSet) {
                itemInternalstd500gID = std500gGoldItemPricingSearchResultSet.getValue('internalid');
                return true;
            });

            var std1kgGoldItemPricingSearch = nlapiLoadSearch('noninventoryitem', 'customsearch3745');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_carrier', null, 'anyof', 5);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_product_weight', null, 'anyof', 3);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_item_zones', null, 'anyof', nsZoneID);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_item_receiver_zones', null, 'anyof', 1);
            if (avg_daily_shipments == 1 || avg_daily_shipments == 2) {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 13);
            } else {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 14);
            }
            std1kgGoldItemPricingSearch.addFilters(newFilters);

            var std1kgGoldItemPricingSearchResult = std1kgGoldItemPricingSearch.runSearch();

            var itemInternalstd1kgID = null;
            std1kgGoldItemPricingSearchResult.forEachResult(function (std1kgGoldItemPricingSearchResultSet) {
                itemInternalstd1kgID = std1kgGoldItemPricingSearchResultSet.getValue('internalid');
                return true;
            });


            var std3kgGoldItemPricingSearch = nlapiLoadSearch('noninventoryitem', 'customsearch3745');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_carrier', null, 'anyof', 5);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_product_weight', null, 'anyof', 2);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_item_zones', null, 'anyof', nsZoneID);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_item_receiver_zones', null, 'anyof', 1);
            if (avg_daily_shipments == 1 || avg_daily_shipments == 2) {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 13);
            } else {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 14);
            }
            std3kgGoldItemPricingSearch.addFilters(newFilters);

            var std3kgGoldItemPricingSearchResult = std3kgGoldItemPricingSearch.runSearch();

            var itemInternalstd3kgID = null;
            std3kgGoldItemPricingSearchResult.forEachResult(function (std3kgGoldItemPricingSearchResultSet) {
                itemInternalstd3kgID = std3kgGoldItemPricingSearchResultSet.getValue('internalid');
                return true;
            });

            var std5kgGoldItemPricingSearch = nlapiLoadSearch('noninventoryitem', 'customsearch3745');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_carrier', null, 'anyof', 5);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_product_weight', null, 'anyof', 1);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_item_zones', null, 'anyof', nsZoneID);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_item_receiver_zones', null, 'anyof', 1);
            if (avg_daily_shipments == 1 || avg_daily_shipments == 2) {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 13);
            } else {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 14);
            }

            std5kgGoldItemPricingSearch.addFilters(newFilters);

            var std5kgGoldItemPricingSearchResult = std5kgGoldItemPricingSearch.runSearch();

            var itemInternalstd5kgID = null;
            std5kgGoldItemPricingSearchResult.forEachResult(function (std5kgGoldItemPricingSearchResultSet) {
                itemInternalstd5kgID = std5kgGoldItemPricingSearchResultSet.getValue('internalid');
                return true;
            });


            var std10kgGoldItemPricingSearch = nlapiLoadSearch('noninventoryitem', 'customsearch3745');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_carrier', null, 'anyof', 5);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_product_weight', null, 'anyof', 8);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_item_zones', null, 'anyof', nsZoneID);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_item_receiver_zones', null, 'anyof', 1);
            if (avg_daily_shipments == 1 || avg_daily_shipments == 2) {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 13);
            } else {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 14);
            }
            std10kgGoldItemPricingSearch.addFilters(newFilters);

            var std10kgGoldItemPricingSearchResult = std10kgGoldItemPricingSearch.runSearch();

            var itemInternalstd10kgID = null;
            std10kgGoldItemPricingSearchResult.forEachResult(function (std10kgGoldItemPricingSearchResultSet) {
                itemInternalstd10kgID = std10kgGoldItemPricingSearchResultSet.getValue('internalid');
                return true;
            });

            var std20kgGoldItemPricingSearch = nlapiLoadSearch('noninventoryitem', 'customsearch3745');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_carrier', null, 'anyof', 5);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_product_weight', null, 'anyof', 11);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_item_zones', null, 'anyof', nsZoneID);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_item_receiver_zones', null, 'anyof', 1);
            if (avg_daily_shipments == 1 || avg_daily_shipments == 2) {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 13);
            } else {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 14);
            }
            std20kgGoldItemPricingSearch.addFilters(newFilters);

            var std20kgGoldItemPricingSearchResult = std20kgGoldItemPricingSearch.runSearch();

            var itemInternalstd20kgID = null;
            std20kgGoldItemPricingSearchResult.forEachResult(function (std20kgGoldItemPricingSearchResultSet) {
                itemInternalstd20kgID = std20kgGoldItemPricingSearchResultSet.getValue('internalid');
                return true;
            });

            var std25kgGoldItemPricingSearch = nlapiLoadSearch('noninventoryitem', 'customsearch3745');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_carrier', null, 'anyof', 5);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_product_weight', null, 'anyof', 9);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_item_zones', null, 'anyof', nsZoneID);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_item_receiver_zones', null, 'anyof', 1);
            if (avg_daily_shipments == 1 || avg_daily_shipments == 2) {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 13);
            } else {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 14);
            }
            std25kgGoldItemPricingSearch.addFilters(newFilters);

            var std25kgGoldItemPricingSearchResult = std25kgGoldItemPricingSearch.runSearch();

            var itemInternalstd25kgID = null;
            std25kgGoldItemPricingSearchResult.forEachResult(function (std25kgGoldItemPricingSearchResultSet) {
                itemInternalstd25kgID = std25kgGoldItemPricingSearchResultSet.getValue('internalid');
                return true;
            });

            var prodPricingRecord = nlapiCreateRecord('customrecord_product_pricing');
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_last_update', getDate());
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_customer', customerRecordId);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_delivery_speeds', 1);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_20kg', itemInternalstd20kgID);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_250g', itemInternalstd250gID);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_10kg', itemInternalstd10kgID);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_25kg', itemInternalstd25kgID);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_500g', itemInternalstd500gID);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_1kg', itemInternalstd1kgID);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_3kg', itemInternalstd3kgID);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_5kg', itemInternalstd5kgID);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_status', 2);
            prodPricingRecord.setFieldValue('custrecord_sycn_complete', 2);
            if (avg_daily_shipments == 1 || avg_daily_shipments == 2) {
                prodPricingRecord.setFieldValue('custrecord_prod_pricing_pricing_plan', 13);
            } else {
                prodPricingRecord.setFieldValue('custrecord_prod_pricing_pricing_plan', 14);
            }
            nlapiSubmitRecord(prodPricingRecord);

            /*
            5Kg	    1
            3Kg	    2
            1Kg	    3
            500g	4
            B4	    5
            10Kg	8
            25Kg	9
            250g	10
            */
            var expB4ItemPricingSearch = nlapiLoadSearch('noninventoryitem', 'customsearch3745');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_carrier', null, 'anyof', 2);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_product_weight', null, 'anyof', 5);
            if (avg_daily_shipments == 1 || avg_daily_shipments == 2) {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 15);
            } else {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 16);
            }

            expB4ItemPricingSearch.addFilters(newFilters);

            var expB4ItemPricingSearchResult = expB4ItemPricingSearch.runSearch();

            var itemInternalexpB4ID = null;
            expB4ItemPricingSearchResult.forEachResult(function (expB4ItemPricingSearchResultSet) {
                itemInternalexpB4ID = expB4ItemPricingSearchResultSet.getValue('internalid');
                return true;
            });

            var exp500gItemPricingSearch = nlapiLoadSearch('noninventoryitem', 'customsearch3745');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_carrier', null, 'anyof', 2);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_product_weight', null, 'anyof', 4);
            if (avg_daily_shipments == 1 || avg_daily_shipments == 2) {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 15);
            } else {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 16);
            }

            exp500gItemPricingSearch.addFilters(newFilters);

            var exp500gItemPricingSearchResult = exp500gItemPricingSearch.runSearch();

            var itemInternalexp500gID = null;
            exp500gItemPricingSearchResult.forEachResult(function (exp500gItemPricingSearchResultSet) {
                itemInternalexp500gID = exp500gItemPricingSearchResultSet.getValue('internalid');
                return true;
            });


            var exp1kgItemPricingSearch = nlapiLoadSearch('noninventoryitem', 'customsearch3745');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_carrier', null, 'anyof', 2);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_product_weight', null, 'anyof', 3);
            if (avg_daily_shipments == 1 || avg_daily_shipments == 2) {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 15);
            } else {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 16);
            }

            exp1kgItemPricingSearch.addFilters(newFilters);

            var exp1kgItemPricingSearchResult = exp1kgItemPricingSearch.runSearch();

            var itemInternalexp1kgID = null;
            exp1kgItemPricingSearchResult.forEachResult(function (exp1kgItemPricingSearchResultSet) {
                itemInternalexp1kgID = exp1kgItemPricingSearchResultSet.getValue('internalid');
                return true;
            });


            var exp3kgItemPricingSearch = nlapiLoadSearch('noninventoryitem', 'customsearch3745');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_carrier', null, 'anyof', 2);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_product_weight', null, 'anyof', 2);
            if (avg_daily_shipments == 1 || avg_daily_shipments == 2) {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 15);
            } else {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 16);
            }

            exp3kgItemPricingSearch.addFilters(newFilters);

            var exp3kgItemPricingSearchResult = exp3kgItemPricingSearch.runSearch();

            var itemInternalexp3kgID = null;
            exp3kgItemPricingSearchResult.forEachResult(function (exp3kgItemPricingSearchResultSet) {
                itemInternalexp3kgID = exp3kgItemPricingSearchResultSet.getValue('internalid');
                return true;
            });

            var exp5kgItemPricingSearch = nlapiLoadSearch('noninventoryitem', 'customsearch3745');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_carrier', null, 'anyof', 2);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_product_weight', null, 'anyof', 1);
            if (avg_daily_shipments == 1 || avg_daily_shipments == 2) {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 15);
            } else {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 16);
            }

            exp5kgItemPricingSearch.addFilters(newFilters);

            var exp5kgItemPricingSearchResult = exp5kgItemPricingSearch.runSearch();

            var itemInternalexp5kgID = null;
            exp5kgItemPricingSearchResult.forEachResult(function (exp5kgItemPricingSearchResultSet) {
                itemInternalexp5kgID = exp5kgItemPricingSearchResultSet.getValue('internalid');
                return true;
            });


            var prodPricingRecord = nlapiCreateRecord('customrecord_product_pricing');
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_last_update', getDate());
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_customer', customerRecordId);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_delivery_speeds', 2);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_b4', itemInternalexpB4ID);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_500g', itemInternalexp500gID);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_1kg', itemInternalexp1kgID);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_3kg', itemInternalexp3kgID);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_5kg', itemInternalexp5kgID);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_status', 2);
            prodPricingRecord.setFieldValue('custrecord_sycn_complete', 2);
            if (avg_daily_shipments == 1 || avg_daily_shipments == 2) {
                prodPricingRecord.setFieldValue('custrecord_prod_pricing_pricing_plan', 15);
            } else {
                prodPricingRecord.setFieldValue('custrecord_prod_pricing_pricing_plan', 16);
            }
            nlapiSubmitRecord(prodPricingRecord);

            /*
           5Kg	    1
           3Kg	    2
           1Kg	    3
           500g	4
           B4	    5
           10Kg	8
           25Kg	9
           250g	10
           */
            var premium10kgItemPricingSearch = nlapiLoadSearch('noninventoryitem', 'customsearch3745');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_carrier', null, 'anyof', 9);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_product_weight', null, 'anyof', 8);
            if (avg_daily_shipments == 1 || avg_daily_shipments == 2) {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 17);
            } else {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 18);
            }

            premium10kgItemPricingSearch.addFilters(newFilters);

            var premium10kgItemPricingSearchResult = premium10kgItemPricingSearch.runSearch();

            var itemInternalpremium10kgID = null;
            premium10kgItemPricingSearchResult.forEachResult(function (premium10kgItemPricingSearchResultSet) {
                itemInternalpremium10kgID = premium10kgItemPricingSearchResultSet.getValue('internalid');
                return true;
            });

            var premium20kgItemPricingSearch = nlapiLoadSearch('noninventoryitem', 'customsearch3745');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_carrier', null, 'anyof', 9);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_product_weight', null, 'anyof', 11);
            if (avg_daily_shipments == 1 || avg_daily_shipments == 2) {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 17);
            } else {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 18);
            }

            premium20kgItemPricingSearch.addFilters(newFilters);

            var premium20kgItemPricingSearchResult = premium20kgItemPricingSearch.runSearch();

            var itemInternalPremium20kgID = null;
            premium20kgItemPricingSearchResult.forEachResult(function (premium20kgItemPricingSearchResultSet) {
                itemInternalPremium20kgID = premium20kgItemPricingSearchResultSet.getValue('internalid');
                return true;
            });


            var premium1kgItemPricingSearch = nlapiLoadSearch('noninventoryitem', 'customsearch3745');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_carrier', null, 'anyof', 9);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_product_weight', null, 'anyof', 3);
            if (avg_daily_shipments == 1 || avg_daily_shipments == 2) {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 17);
            } else {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 18);
            }

            premium1kgItemPricingSearch.addFilters(newFilters);

            var premium1kgItemPricingSearchResult = premium1kgItemPricingSearch.runSearch();

            var itemInternalPremium1kgID = null;
            premium1kgItemPricingSearchResult.forEachResult(function (premium1kgItemPricingSearchResultSet) {
                itemInternalPremium1kgID = premium1kgItemPricingSearchResultSet.getValue('internalid');
                return true;
            });


            var premium3kgItemPricingSearch = nlapiLoadSearch('noninventoryitem', 'customsearch3745');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_carrier', null, 'anyof', 9);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_product_weight', null, 'anyof', 2);
            if (avg_daily_shipments == 1 || avg_daily_shipments == 2) {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 17);
            } else {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 18);
            }

            premium3kgItemPricingSearch.addFilters(newFilters);

            var premium3kgItemPricingSearchResult = premium3kgItemPricingSearch.runSearch();

            var itemInternalPremium3kgID = null;
            premium3kgItemPricingSearchResult.forEachResult(function (premium3kgItemPricingSearchResultSet) {
                itemInternalPremium3kgID = premium3kgItemPricingSearchResultSet.getValue('internalid');
                return true;
            });

            var premium5kgItemPricingSearch = nlapiLoadSearch('noninventoryitem', 'customsearch3745');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_carrier', null, 'anyof', 9);
            newFilters[newFilters.length] = new nlobjSearchFilter(
                'custitem_product_weight', null, 'anyof', 1);
            if (avg_daily_shipments == 1 || avg_daily_shipments == 2) {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 17);
            } else {
                newFilters[newFilters.length] = new nlobjSearchFilter(
                    'custitem_price_plans', null, 'anyof', 18);
            }

            premium5kgItemPricingSearch.addFilters(newFilters);

            var premium5kgItemPricingSearchResult = premium5kgItemPricingSearch.runSearch();

            var itemInternalPremium5kgID = null;
            premium5kgItemPricingSearchResult.forEachResult(function (premium5kgItemPricingSearchResultSet) {
                itemInternalPremium5kgID = premium5kgItemPricingSearchResultSet.getValue('internalid');
                return true;
            });


            var prodPricingRecord = nlapiCreateRecord('customrecord_product_pricing');
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_last_update', getDate());
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_customer', customerRecordId);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_delivery_speeds', 4);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_10kg', itemInternalpremium10kgID);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_20kg', itemInternalPremium20kgID);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_1kg', itemInternalPremium1kgID);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_3kg', itemInternalPremium3kgID);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_5kg', itemInternalPremium5kgID);
            prodPricingRecord.setFieldValue('custrecord_prod_pricing_status', 2);
            prodPricingRecord.setFieldValue('custrecord_sycn_complete', 2);
            if (avg_daily_shipments == 1 || avg_daily_shipments == 2) {
                prodPricingRecord.setFieldValue('custrecord_prod_pricing_pricing_plan', 17);
            } else {
                prodPricingRecord.setFieldValue('custrecord_prod_pricing_pricing_plan', 18);
            }
            nlapiSubmitRecord(prodPricingRecord);

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

            if (!isNullorEmpty(zee_id) && zeeCount == 1) {

                if (services_of_interest == '2') {
                } else {
                    var partner_record = nlapiLoadRecord('partner', zee_id);
                    var mp_std_activated = partner_record.getFieldValue('custentity_zee_mp_std_activated');
                    var mp_exp_activated = partner_record.getFieldValue('custentity_zee_mp_std_activated');
                    if ((mp_std_activated != 1 || mp_std_activated != '1') && (mp_exp_activated == 2 || mp_exp_activated == '2')) {
                        //NO SIGN UP EMAIL IF BOTH EXPRESS & STANDARD NOT ACTIVATED
                    } else {
                        //Send Email to Customer who filled out the Landing Page Form

                    }
                }
            }

            var url =
                'https://1048144.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=395&deploy=1&compid=1048144&h=6d4293eecb3cb3f4353e&rectype=customer&template=';
            var template_id = 164;
            var newLeadEmailTemplateRecord = nlapiLoadRecord(
                'customrecord_camp_comm_template', template_id);
            var templateSubject = newLeadEmailTemplateRecord.getFieldValue(
                'custrecord_camp_comm_subject');
            var emailAttach = new Object();
            emailAttach['entity'] = customerRecordId;

            var customer_record = nlapiLoadRecord('customer', customerRecordId);
            var entity_id = customer_record.getFieldValue('entityid');
            var customer_name = customer_record.getFieldValue('companyname');

            templateSubject = entity_id + ' ' + customer_name + ' - ' + templateSubject

            url += template_id + '&recid=' + customerRecordId + '&salesrep=' +
                salesRep + '&dear=' + first_name + '&contactid=' + contactId + '&userid=' +
                encodeURIComponent(nlapiGetContext().getUser());;
            urlCall = nlapiRequestURL(url);
            var emailHtml = urlCall.getBody();

            if (pageURL != 'https://mailplus.com.au/lpo-lead-generation/') {
                if (isNullorEmpty(salesRep)) {
                    if (pageURL == 'https://mailplus.com.au/lpo-partnership/') {
                        nlapiSendEmail(112209, email, templateSubject, emailHtml, ['luke.forbes@mailplus.com.au', 'paul.mcintosh@mailplus.com.au', 'alison.savona@mailplus.com.au'], null, emailAttach, emailAttach);
                    } else {
                        nlapiSendEmail(112209, email, templateSubject, emailHtml, ['luke.forbes@mailplus.com.au', 'lee.russell@mailplus.com.au'], null, emailAttach, emailAttach);
                    }
                } else {
                    nlapiSendEmail(salesRep, email, templateSubject, emailHtml, salesRep, null,
                        emailAttach, emailAttach);
                }

            }

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
