function createLead(data) {

    //NEW CUSTOMER RECORD
    var dataOut = '{"dataOut":[';

    nlapiLogExecution('DEBUG', 'data', data);

    for (var fieldname in data) {
        if (data.hasOwnProperty(fieldname)) {
            for (var x = 0; x < data[fieldname].length; x++) {
                nlapiLogExecution('DEBUG', 'data[fieldname][x][businessName]', data[fieldname][x]['businessName']);
                nlapiLogExecution('DEBUG', 'data[fieldname][x][city]', data[fieldname][x]['city']);
                nlapiLogExecution('DEBUG', 'data[fieldname][x][state]', data[fieldname][x]['state']);
                nlapiLogExecution('DEBUG', 'data[fieldname][x][zip]', data[fieldname][x]['zip']);
                nlapiLogExecution('DEBUG', 'data[fieldname][x][addr1]', data[fieldname][x]['addr1']);
                nlapiLogExecution('DEBUG', 'data[fieldname][x][addr2]', data[fieldname][x]['addr2']);
                if (isNullorEmpty(data[fieldname][x]['city']) || isNullorEmpty(data[fieldname][x]['state']) || isNullorEmpty(data[fieldname][x]['zip']) || data[fieldname][x]['city'] == "n/a" || data[fieldname][x]['state'] == "n/a" || data[fieldname][x]['zip'] == "n/a") {
                    dataOut += '{"ns_id":"ADDRESS ERROR - Empty city, state and/or zip. The lead was not created."},';
                } else { //lead only created if the address is correct

                    var business_name = data[fieldname][x]['businessName'];
                    var first_name = data[fieldname][x]['firstName'];
                    var last_name = data[fieldname][x]['lastName'];
                    var email = data[fieldname][x]['email'];
                    var phone_number = data[fieldname][x]['phone'];

                    var city = data[fieldname][x]['city'];
                    var state = data[fieldname][x]['state'];
                    var postcode = data[fieldname][x]['zip'];

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

                    zeeNetworkMatrixSearchResults.forEachResult(function (searchResult) {

                        zee_id = searchResult.getValue('internalid');

                        nlapiLogExecution('DEBUG', 'zee_id|count:' + zeeCount, zee_id);


                        zeeCount++;
                        return true;
                    });

                    nlapiLogExecution('DEBUG', 'zeeCount', zeeCount);
                    nlapiLogExecution('DEBUG', 'zee_id', zee_id);



                    var customerRecord = nlapiCreateRecord('lead');
                    customerRecord.setFieldValue('companyname', data[fieldname][x]['businessName']);
                    customerRecord.setFieldValue('custentity_email_service', data[fieldname][x]['email']);
                    customerRecord.setFieldValue('phone', data[fieldname][x]['phone']);
                    if (data[fieldname][x]['leadsource'].toLowerCase() == 'portal') {
                        var quadient = data[fieldname][x]['businessName'].substring(0, 10);
                        nlapiLogExecution('DEBUG', 'quadient', quadient);
                        if (quadient == 'Quadient -') {
                            customerRecord.setFieldValue('leadsource', 246616); //Quadient
                        } else {
                            customerRecord.setFieldValue('leadsource', 99417); //Inbound - Web
                        }
                    } else if (data[fieldname][x]['leadsource'].toLowerCase() == 'shopify') {
                        customerRecord.setFieldValue('leadsource', 246306); //Shopify
                    } else if (data[fieldname][x]['leadsource'].toLowerCase() == 'airush') {
                        customerRecord.setFieldValue('leadsource', 246307); //Airush
                    }
                    customerRecord.setFieldValue('entitystatus', 57); //Suspect - Hot Lead
                    customerRecord.setFieldValue('custentity_hotleads', 'T');

                    if (isNullorEmpty(zee_id) || zeeCount > 1) {
                        customerRecord.setFieldValue('partner', 435);//MailPlus Pty Ltd
                    } else if (!isNullorEmpty(zee_id) && zeeCount == 1) {
                        //Create suspect in NetSuite
                        //Assign lead to franchisee
                        //create sales record
                        //Send sign up email to customer

                        var serviceFuelSurchargeToBeApplied = 0;
                        var partner_record;
                        if (!isNullorEmpty(zee_id) && zeeCount == 1) {
                            partnerRecord = nlapiLoadRecord('partner', zee_id);
                            serviceFuelSurchargeToBeApplied = partnerRecord.getFieldValue(
                                'custentity_service_fuel_surcharge_apply');
                        }
                        customerRecord.setFieldValue('partner', zee_id);
                        if (serviceFuelSurchargeToBeApplied == 1 ||
                            serviceFuelSurchargeToBeApplied == '1') {
                            customerRecord.setFieldValue('custentity_service_fuel_surcharge', 1);
                            if (zee_id == 218 || zee_id == 469) {
                                customerRecord.setFieldValue('custentity_service_fuel_surcharge_percen',
                                    '5.3');
                            } else {
                                customerRecord.setFieldValue('custentity_service_fuel_surcharge_percen',
                                    '9.5');
                            }
                        }
                    }
                    customerRecord.setFieldValue('custentity_industry_category', 19); //Other services
                    customerRecord.setFieldValue('custentity_date_lead_entered', getDate());
                    customerRecord.setFieldValue('custentity_lead_entered_by', 585236); //Portal
                    customerRecord.setFieldValue('custentity_frequency', data[fieldname][x]['frequency']);
                    customerRecord.setFieldValue('custentity_mpex_customer', 1);
                    customerRecord.setFieldValue('custentity_portal_access', 1);

                    //ADDRESS
                    customerRecord.selectNewLineItem('addressbook');
                    customerRecord.setCurrentLineItemValue('addressbook', 'country', 'AU');
                    customerRecord.setCurrentLineItemValue('addressbook', 'addressee', data[fieldname][x]['businessName']);
                    customerRecord.setCurrentLineItemValue('addressbook', 'addr2', data[fieldname][x]['addr1']); //reversed because comes the other way from the portal
                    if (data[fieldname][x]['addr2'] != "n/a" && data[fieldname][x]['addr2'] != "N/A") {
                        customerRecord.setCurrentLineItemValue('addressbook', 'addr1', data[fieldname][x]['addr2']);
                    }
                    customerRecord.setCurrentLineItemValue('addressbook', 'city', data[fieldname][x]['city']);
                    customerRecord.setCurrentLineItemValue('addressbook', 'state', formatStateName(data[fieldname][x]['state']));
                    customerRecord.setCurrentLineItemValue('addressbook', 'zip', data[fieldname][x]['zip']);

                    var fullAddress = '' + data[fieldname][x]['addr1'] + ',' + data[fieldname][x]['city'] + ',' + formatStateName(data[fieldname][x]['state']) + '';
                    nlapiLogExecution('DEBUG', 'fullAddress', fullAddress);

                    var result = nlapiRequestURL('https://maps.googleapis.com/maps/api/geocode/json?address=' + fullAddress + '&key=AIzaSyA92XGDo8rx11izPYT7z2L-YPMMJ6Ih1s0&libraries=places');

                    var resultJSON = JSON.parse(result.getBody());

                    var subrecord = customerRecord.editCurrentLineItemSubrecord('addressbook', 'addressbookaddress');

                    var lat = resultJSON.results[0].geometry.location.lat;
                    var lng = resultJSON.results[0].geometry.location.lng;
                    //var lat = data[fieldname][x]['lat'];
                    //var lng = data[fieldname][x]['lng'];
                    nlapiLogExecution('DEBUG', 'lat', lat);
                    nlapiLogExecution('DEBUG', 'lng', lng);
                    //subrecord.setFieldValue('custrecord_address_lat', lat);
                    //subrecord.setFieldValue('custrecord_address_lon', lng);
                    customerRecord.setCurrentLineItemValue('addressbook', 'custrecord_address_lat', lat);
                    customerRecord.setCurrentLineItemValue('addressbook', 'custrecord_address_lon', lng);
                    //subrecord.commit();
                    customerRecord.commitLineItem('addressbook');

                    customerRecord.setFieldValue('custentity_mpex_surcharge_rate', '33.2');
                    customerRecord.setFieldValue('custentity_mpex_surcharge', 1);
                    customerRecord.setFieldValue('custentity_sendle_fuel_surcharge', '7.05');


                    var customerRecordId = nlapiSubmitRecord(customerRecord);

                    //CONTACT
                    var contactRecord = nlapiCreateRecord('contact');
                    //contactRecord.setFieldValue('salutation', salutation);
                    contactRecord.setFieldValue('firstname', data[fieldname][x]['firstName']);
                    contactRecord.setFieldValue('lastname', data[fieldname][x]['lastName']);
                    contactRecord.setFieldValue('email', data[fieldname][x]['email']);
                    contactRecord.setFieldValue('phone', data[fieldname][x]['phone']);
                    //contactRecord.setFieldValue('title', position);
                    contactRecord.setFieldValue('company', customerRecordId);
                    contactRecord.setFieldValue('entityid', data[fieldname][x]['firstName'] + ' ' + data[fieldname][x]['lastName']);
                    //contactRecord.setFieldValue('contactrole', role);
                    var contactId = nlapiSubmitRecord(contactRecord);

                    //USER NOTE
                    if (!isNullorEmpty(data[fieldname][x]['comments']) || data[fieldname][x]['comments'] != 'N/A') {
                        var userNoteRecord = nlapiCreateRecord('note');
                        userNoteRecord.setFieldValue('title', 'Portal');
                        userNoteRecord.setFieldValue('entity', customerRecordId);
                        //userNoteRecord.setFieldValue('notetype', $('#notetype option:selected').val());
                        userNoteRecord.setFieldValue('note', data[fieldname][x]['comments']);
                        userNoteRecord.setFieldValue('author', nlapiGetUser());
                        userNoteRecord.setFieldValue('notedate', getDate());
                        nlapiSubmitRecord(userNoteRecord);
                    }

                    //SALES REP
                    var customer_record = nlapiLoadRecord('customer', customerRecordId);
                    var entity_id = customer_record.getFieldValue('entityid');
                    var customer_name = customer_record.getFieldValue('companyname');

                    if (!isNullorEmpty(zee_id) && zeeCount == 1) {

                        //Prospect - Quote Sent
                        customer_record.setFieldValue('entitystatus', 50);
                        customer_record.setFieldValue('custentity_date_lead_quote_sent',
                            getDate());

                        var customerRecordId = nlapiSubmitRecord(customer_record);
                    }

                    var postcode = parseInt(postcode);

                    var salesRep = 112209;


                    if (isNullorEmpty(zee_id) || zeeCount > 1) {

                        var from = 112209; //MailPlus team
                        var to;
                        var cc = ['luke.forbes@mailplus.com.au', 'belinda.urbani@mailplus.com.au',
                            'ankith.ravindran@mailplus.com.au'
                        ];
                        var subject = 'Sales HOT Lead - ' + entity_id + ' ' + customer_name + '';
                        var cust_id_link =
                            'https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' +
                            customerRecordId;
                        var body =
                            'New sales record has been created. \n A HOT Lead has been entered into the System. Please respond in an hour. \n Customer Name: ' +
                            entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;

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
                                nlapiSendEmail(from, to, subject, body, cc);
                                var salesRecord = nlapiCreateRecord('customrecord_sales');
                                var salesRep = 668711; //Lee Russell

                                salesRecord.setFieldValue('custrecord_sales_customer',
                                    customerRecordId);
                                salesRecord.setFieldValue('custrecord_sales_campaign', 67); //Field Sales
                                salesRecord.setFieldValue('custrecord_sales_assigned', 668711);
                                salesRecord.setFieldValue('custrecord_sales_outcome', 5);
                                salesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
                                var date = new Date();
                                salesRecord.setFieldValue('custrecord_sales_callbacktime',
                                    nlapiDateToString(date, 'timeofday'));
                                nlapiSubmitRecord(salesRecord);
                            } else if (postcode == 2481) { //Albury
                                to = ['david.gdanski@mailplus.com.au'];
                                body =
                                    'Hi David, \n \nA HOT Lead has been entered into the System.\n Customer Name: ' +
                                    entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;
                                nlapiSendEmail(from, to, subject, body, cc);
                                var salesRecord = nlapiCreateRecord('customrecord_sales');
                                var salesRep = 690145; //Lee Russell

                                salesRecord.setFieldValue('custrecord_sales_customer',
                                    customerRecordId);
                                salesRecord.setFieldValue('custrecord_sales_campaign', 67); //Field Sales
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

                                nlapiSendEmail(from, to, subject, body, cc);

                                salesRecord.setFieldValue('custrecord_sales_customer',
                                    customerRecordId);
                                salesRecord.setFieldValue('custrecord_sales_campaign', 67); //Field Sales
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
                                var salesRep = 668712; //David Gdanski
                                to = ['belinda.urbani@mailplus.com.au']
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

                            nlapiSendEmail(from, to, subject, body, cc);

                            salesRecord.setFieldValue('custrecord_sales_customer', customerRecordId);
                            salesRecord.setFieldValue('custrecord_sales_campaign', 67); //Field Sales
                            salesRecord.setFieldValue('custrecord_sales_assigned', salesRep);
                            salesRecord.setFieldValue('custrecord_sales_outcome', 5);
                            salesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
                            var date = new Date();
                            salesRecord.setFieldValue('custrecord_sales_callbacktime',
                                nlapiDateToString(date, 'timeofday'));
                            nlapiSubmitRecord(salesRecord);
                        }


                        // var from = 112209; //MailPlus team
                        // var to = ['laura.busse@mailplus.com.au'];
                        // var cc = ['fiona.harrison@mailplus.com.au', 'popie.popie@mailplus.com.au',
                        //     'ankith.ravindran@mailplus.com.au'
                        // ];
                        // var subject = 'Check Service Territory - Sales Lead - ' + entity_id + ' ' + customer_name + '';
                        // var cust_id_link =
                        //     'https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' +
                        //     customerRecordId;
                        // var body =
                        //     'New sales lead has been created in NetSuite. \n Please validate if the lead can be serviced by a franchisee. \n Customer Name: ' +
                        //     entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;

                        // nlapiSendEmail(from, to, subject, body, cc);

                    } else if (!isNullorEmpty(zee_id) && zeeCount == 1) {
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
                                salesRecord.setFieldValue('custrecord_sales_campaign', 67); //Field Sales
                                salesRecord.setFieldValue('custrecord_sales_assigned', 668711);
                                salesRecord.setFieldValue('custrecord_sales_outcome', 5);
                                salesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
                                var date = new Date();
                                salesRecord.setFieldValue('custrecord_sales_callbacktime',
                                    nlapiDateToString(date, 'timeofday'));
                                nlapiSubmitRecord(salesRecord);
                            } else if (postcode == 2481) { //Albury
                                to = ['david.gdanski@mailplus.com.au'];
                                body =
                                    'Hi David, \n \nA HOT Lead has been entered into the System.\n Customer Name: ' +
                                    entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;
                                var salesRecord = nlapiCreateRecord('customrecord_sales');
                                var salesRep = 690145; //Lee Russell

                                salesRecord.setFieldValue('custrecord_sales_customer',
                                    customerRecordId);
                                salesRecord.setFieldValue('custrecord_sales_campaign', 67); //Field Sales
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
                                salesRecord.setFieldValue('custrecord_sales_campaign', 67); //Field Sales
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
                                var salesRep = 690145; //David Gdanski
                                to = ['david.gdanski@mailplus.com.au']
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
                            salesRecord.setFieldValue('custrecord_sales_campaign', 67); //Field Sales
                            salesRecord.setFieldValue('custrecord_sales_assigned', salesRep);
                            salesRecord.setFieldValue('custrecord_sales_outcome', 5);
                            salesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
                            var date = new Date();
                            salesRecord.setFieldValue('custrecord_sales_callbacktime',
                                nlapiDateToString(date, 'timeofday'));
                            nlapiSubmitRecord(salesRecord);
                        }


                    }

                    //
                    var sendleZoneIDSearch = nlapiLoadSearch('customrecord_dom_zones', 'customsearch_sendle_dom_zones');

                    var newFilters = new Array();
                    newFilters[newFilters.length] = new nlobjSearchFilter(
                        'custrecord_dom_zones_postcode', null, 'is', postcode);
                    newFilters[newFilters.length] = new nlobjSearchFilter(
                        'custrecord_dom_zones_suburb_name', null, 'is', city);
                    sendleZoneIDSearch.addFilters(newFilters);

                    var sendleZoneIDSearchResult = sendleZoneIDSearch.runSearch();

                    var nsZoneID = 4;
                    sendleZoneIDSearchResult.forEachResult(function (sendleZoneIDSearchResultSet) {
                        nsZoneID = sendleZoneIDSearchResultSet.getValue('custrecord_dom_zones_ns_zones')

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

                    newFilters[newFilters.length] = new nlobjSearchFilter(
                        'custitem_price_plans', null, 'anyof', 13);

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

                    newFilters[newFilters.length] = new nlobjSearchFilter(
                        'custitem_price_plans', null, 'anyof', 13);

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

                    newFilters[newFilters.length] = new nlobjSearchFilter(
                        'custitem_price_plans', null, 'anyof', 13);

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

                    newFilters[newFilters.length] = new nlobjSearchFilter(
                        'custitem_price_plans', null, 'anyof', 13);

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

                    newFilters[newFilters.length] = new nlobjSearchFilter(
                        'custitem_price_plans', null, 'anyof', 13);


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

                    newFilters[newFilters.length] = new nlobjSearchFilter(
                        'custitem_price_plans', null, 'anyof', 13);

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

                    newFilters[newFilters.length] = new nlobjSearchFilter(
                        'custitem_price_plans', null, 'anyof', 13);

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

                    prodPricingRecord.setFieldValue('custrecord_prod_pricing_pricing_plan', 13);

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

                    newFilters[newFilters.length] = new nlobjSearchFilter(
                        'custitem_price_plans', null, 'anyof', 15);


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

                    newFilters[newFilters.length] = new nlobjSearchFilter(
                        'custitem_price_plans', null, 'anyof', 15);

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

                    newFilters[newFilters.length] = new nlobjSearchFilter(
                        'custitem_price_plans', null, 'anyof', 15);


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

                    newFilters[newFilters.length] = new nlobjSearchFilter(
                        'custitem_price_plans', null, 'anyof', 15);


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

                    newFilters[newFilters.length] = new nlobjSearchFilter(
                        'custitem_price_plans', null, 'anyof', 15);


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
                    prodPricingRecord.setFieldValue('custrecord_prod_pricing_pricing_plan', 15);

                    nlapiSubmitRecord(prodPricingRecord);

                    dataOut += '{"ns_id":"' + customerRecordId + '"},';

                    if (!isNullorEmpty(zee_id) && zeeCount == 1) {


                        var partner_record = nlapiLoadRecord('partner', zee_id);
                        var mp_std_activated = partner_record.getFieldValue('custentity_zee_mp_std_activated');
                        var mp_exp_activated = partner_record.getFieldValue('custentity_zee_mp_std_activated');
                        if ((mp_std_activated != 1 || mp_std_activated != '1') && (mp_exp_activated == 2 || mp_exp_activated == '2')) {
                            //NO SIGN UP EMAIL IF BOTH EXPRESS & STANDARD NOT ACTIVATED
                        } else {
                            //Send Email to Customer who filled out the Landing Page Form
                            var url =
                                'https://1048144.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=395&deploy=1&compid=1048144&h=6d4293eecb3cb3f4353e&rectype=customer&template=';
                            var template_id = 148;
                            var newLeadEmailTemplateRecord = nlapiLoadRecord(
                                'customrecord_camp_comm_template', template_id);
                            var templateSubject = newLeadEmailTemplateRecord.getFieldValue(
                                'custrecord_camp_comm_subject');
                            var emailAttach = new Object();
                            emailAttach['entity'] = customerRecordId;

                            url += template_id + '&recid=' + customerRecordId + '&salesrep=' +
                                salesRep + '&dear=' + first_name + '&contactid=' + contactId + '&userid=' +
                                encodeURIComponent(nlapiGetContext().getUser());;
                            urlCall = nlapiRequestURL(url);
                            var emailHtml = urlCall.getBody();

                            nlapiSendEmail(112209, email, templateSubject, emailHtml, null,
                                null, emailAttach);
                        }

                    }
                }

            }

        }
    }
    dataOut = dataOut.substring(0, dataOut.length - 1);
    dataOut += ']}';
    nlapiLogExecution('DEBUG', 'dataOut', dataOut);
    dataOut = JSON.parse(dataOut);
    return dataOut
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
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
    return position
}

function getTerritory(lat, lng) {
    var territory = [];
    var file = nlapiLoadFile(3772482);
    var data = file.getValue();
    //nlapiLogExecution('DEBUG', 'data', data);
    data = JSON.parse(data);
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
        var isInTerritory = inside([lng, lat], polygon);
        if (isInTerritory == true) {
            territory[territory.length] = territories[k].properties.name;
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