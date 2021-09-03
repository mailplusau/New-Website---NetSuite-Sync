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

function leadForm(request, response) {
    if (request.getMethod() == "GET") {

        nlapiLogExecution('DEBUG', 'request.getParameter', request.getParameter);

        var business_name = request.getParameter('business_name');
        var full_name = request.getParameter('full_name');
        var email_address = request.getParameter('email');
        var phone_number = request.getParameter('phone_number');
        var postcode = request.getParameter('postcode');
        var avg_daily_shipments = request.getParameter('avg_daily_shipments');
        var services_of_interest = request.getParameter('services_of_interest');
        var how_did_you_hear_about_us = request.getParameter('how_did_you_hear_about_us');

        var avg_daily_shipments_text;
        var services_of_interest_text;
        var how_did_you_hear_about_us_text;

        nlapiLogExecution('DEBUG', 'business_name', business_name);
        nlapiLogExecution('DEBUG', 'full_name', full_name);
        nlapiLogExecution('DEBUG', 'email_address', email_address);
        nlapiLogExecution('DEBUG', 'phone_number', phone_number);
        nlapiLogExecution('DEBUG', 'postcode', postcode);
        nlapiLogExecution('DEBUG', 'avg_daily_shipments', avg_daily_shipments);
        nlapiLogExecution('DEBUG', 'services_of_interest', services_of_interest);
        nlapiLogExecution('DEBUG', 'how_did_you_hear_about_us', how_did_you_hear_about_us);

        var params = {
            business_name: business_name,
            full_name: full_name,
            email: email_address,
            phone_number: phone_number,
            postcode: postcode,
            avg_daily_shipments: avg_daily_shipments,
            services_of_interest: services_of_interest,
            how_did_you_hear_about_us: how_did_you_hear_about_us
        };

        //NEW CUSTOMER RECORD
        var dataOut = '{"dataOut":[';

        //If Post code is empty, do not create a record on NetSuite
        if (isNullorEmpty(postcode)) {
            dataOut += '{"ns_id":"ADDRESS ERROR - Empty Post Code"},';
        } else {

            //Create Lead on NetSuite
            var customerRecord = nlapiCreateRecord('lead');
            customerRecord.setFieldValue('companyname', business_name);
            customerRecord.setFieldValue('custentity_email_service', email_address);
            customerRecord.setFieldValue('phone', phone_number);

            var quadient = business_name.substring(0, 10);
            nlapiLogExecution('DEBUG', 'business_name', business_name);
            if (quadient == 'Quadient -') {
                customerRecord.setFieldValue('leadsource', 246616); //Quadient
            } else {
                customerRecord.setFieldValue('leadsource', 254557); //Inbound - New Website
            }
            customerRecord.setFieldValue('entitystatus', 57); //Suspect - Hot Lead
            customerRecord.setFieldValue('custentity_hotleads', 'T');
            customerRecord.setFieldValue('partner', 435); //MailPlus Pty Ltd
            customerRecord.setFieldValue('custentity_industry_category', 19); //Other services
            customerRecord.setFieldValue('custentity_date_lead_entered', getDate());
            customerRecord.setFieldValue('custentity_lead_entered_by', 585236); //Portal
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

            if (how_did_you_hear_about_us == '1') {
                customerRecord.setFieldValue('custentity_how_did_you_hear_about_us', 1);
                how_did_you_hear_about_us_text = 'Social Media (e.g. Facebook)';
            } else if (how_did_you_hear_about_us == '2') {
                customerRecord.setFieldValue('custentity_how_did_you_hear_about_us', 2);
                how_did_you_hear_about_us_text = 'Article';
            } else if (how_did_you_hear_about_us == '3') {
                customerRecord.setFieldValue('custentity_how_did_you_hear_about_us', 3);
                how_did_you_hear_about_us_text = 'Word of Mouth';
            } else if (how_did_you_hear_about_us == '4') {
                customerRecord.setFieldValue('custentity_how_did_you_hear_about_us', 4);
                how_did_you_hear_about_us_text = 'Search Engine (e.g. Google)';
            } else if (how_did_you_hear_about_us == '5') {
                customerRecord.setFieldValue('custentity_how_did_you_hear_about_us', 5);
                how_did_you_hear_about_us_text = 'Online Forum';
            } else {
                customerRecord.setFieldValue('custentity_how_did_you_hear_about_us', 6);
                how_did_you_hear_about_us_text = 'Other';
            }

            if (services_of_interest == '1') {
                customerRecord.setFieldValue('custentity_services_of_interest', 1);
                service_of_interest_text = 'MailPlus Express';
            } else if (services_of_interest == '2') {
                customerRecord.setFieldValue('custentity_services_of_interest', 2);
                service_of_interest_text = 'Post Office Services';
            } else if (services_of_interest == '3') {
                customerRecord.setFieldValue('custentity_services_of_interest', 3);
                service_of_interest_text = 'Biodegradable satchel';
            }

            //ADDRESS
            customerRecord.selectNewLineItem('addressbook');
            customerRecord.setCurrentLineItemValue('addressbook', 'country', 'AU');
            customerRecord.setCurrentLineItemValue('addressbook', 'zip', postcode);
            customerRecord.setCurrentLineItemValue('addressbook', 'addr1', ' ');
            customerRecord.setCurrentLineItemValue('addressbook', 'addr2', ' ');
            customerRecord.setCurrentLineItemValue('addressbook', 'addressee', business_name);
            customerRecord.setCurrentLineItemValue('addressbook', 'city', ' ');
            customerRecord.setCurrentLineItemValue('addressbook', 'state', formatStateName(postcode));
            customerRecord.commitLineItem('addressbook');

            var customerRecordId = nlapiSubmitRecord(customerRecord);



            //Create CONTACT

            //Split Full name based on Space
            var fullNameSplit = full_name.split(' ');

            var contactRecord = nlapiCreateRecord('contact');
            contactRecord.setFieldValue('firstname', fullNameSplit[0]);
            contactRecord.setFieldValue('lastname', fullNameSplit[1]);
            contactRecord.setFieldValue('email', email_address);
            contactRecord.setFieldValue('phone', phone_number);
            contactRecord.setFieldValue('company', customerRecordId);
            contactRecord.setFieldValue('entityid', full_name);
            contactRecord.setFieldValue('contactrole', -10);
            nlapiSubmitRecord(contactRecord);

            var customer_record = nlapiLoadRecord('customer', customerRecordId);
            var entity_id = customer_record.getFieldValue('entityid');
            var customer_name = customer_record.getFieldValue('companyname');
            var usage_per_week = customer_record.getFieldText('custentity_form_mpex_usage_per_week');
            var hear_about_us = customer_record.getFieldText('custentity_how_did_you_hear_about_us');
            var interests = customer_record.getFieldText('custentity_services_of_interest');



            var note_value = '';
            note_value += 'Average Daily Shipment: ' + usage_per_week + '/\n';
            note_value += 'How did you hear about us: ' + hear_about_us + '/\n';
            note_value += 'Service of Interest: ' + interests + '/\n';

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


            var from = 112209; //MailPlus team
            var to;
            var cc = ['luke.forbes@mailplus.com.au', 'belinda.urbani@mailplus.com.au', 'ankith.ravindran@mailplus.com.au'];
            var subject = 'Sales HOT Lead - ' + entity_id + ' ' + customer_name + '';
            var cust_id_link = 'https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' + customerRecordId;
            var body = 'New sales record has been created. \n A HOT Lead has been entered into the System. Please respond in an hour. \n Customer Name: ' + entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;

            var postcode = parseInt(postcode);

            //ACT & NSW Postcodes
            if (postcode >= 2000 && postcode <= 2999) {
                var postcode = parseInt(postcode);
                //Byron Bay Postcodes
                if (postcode == 2481 || postcode == 2482 || postcode == 2485 || postcode == 2486 || postcode == 2487 || postcode == 2488 || postcode == 2479) {
                    to = ['lee.russell@mailplus.com.au'];
                    body = 'Hi Lee, \n \nA HOT Lead has been entered into the System.\n Customer Name: ' + entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;
                    nlapiSendEmail(from, to, subject, body, cc);
                    var salesRecord = nlapiCreateRecord('customrecord_sales');
                    var salesRep = 668711; //Lee Russell

                    salesRecord.setFieldValue('custrecord_sales_customer', customerRecordId);
                    salesRecord.setFieldValue('custrecord_sales_campaign', 62); //Field Sales
                    salesRecord.setFieldValue('custrecord_sales_assigned', salesRep);
                    salesRecord.setFieldValue('custrecord_sales_outcome', 5);
                    salesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
                    var date = new Date();
                    salesRecord.setFieldValue('custrecord_sales_callbacktime', nlapiDateToString(date, 'timeofday'));
                    nlapiSubmitRecord(salesRecord);
                } else if (postcode == 2481) { //Albury
                    to = ['david.gdanski@mailplus.com.au'];
                    body = 'Hi David, \n \nA HOT Lead has been entered into the System.\n Customer Name: ' + entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;
                    nlapiSendEmail(from, to, subject, body, cc);
                    var salesRecord = nlapiCreateRecord('customrecord_sales');
                    var salesRep = 690145; //Lee Russell

                    salesRecord.setFieldValue('custrecord_sales_customer', customerRecordId);
                    salesRecord.setFieldValue('custrecord_sales_campaign', 62); //Field Sales
                    salesRecord.setFieldValue('custrecord_sales_assigned', salesRep);
                    salesRecord.setFieldValue('custrecord_sales_outcome', 5);
                    salesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
                    var date = new Date();
                    salesRecord.setFieldValue('custrecord_sales_callbacktime', nlapiDateToString(date, 'timeofday'));
                    nlapiSubmitRecord(salesRecord);
                } else {
                    //ACT Post Codes
                    var salesRecord = nlapiCreateRecord('customrecord_sales');
                    var salesRep = 696160; //Kerina Helliwell
                    to = ['kerina.helliwell@mailplus.com.au'];
                    nlapiSendEmail(from, to, subject, body, cc);

                    salesRecord.setFieldValue('custrecord_sales_customer', customerRecordId);
                    salesRecord.setFieldValue('custrecord_sales_campaign', 62); //Field Sales
                    salesRecord.setFieldValue('custrecord_sales_assigned', salesRep);
                    salesRecord.setFieldValue('custrecord_sales_outcome', 5);
                    salesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
                    var date = new Date();
                    salesRecord.setFieldValue('custrecord_sales_callbacktime', nlapiDateToString(date, 'timeofday'));
                    nlapiSubmitRecord(salesRecord);

                }

            } else { //Everything else

                //Create Sales Record
                var salesRecord = nlapiCreateRecord('customrecord_sales');
                if ((postcode >= 3000 && postcode <= 3999) || (postcode >= 5000 && postcode <= 5999) || (postcode >= 7000 && postcode <= 7999)) { //VIC & SA & TAS Postcodes
                    var salesRep = 690145; //David Gdanski
                    to = ['david.gdanski@mailplus.com.au']
                } else if ((postcode >= 4000 && postcode <= 4999) || (postcode >= 800 && postcode <= 999) || (postcode >= 6000 && postcode <= 6999)) { //QLD & NT & WA Postcodes
                    var salesRep = 668711; //Lee Russell
                    to = ['lee.russell@mailplus.com.au']
                } else { //Everything else
                    var salesRep = 668712; //Belinda Urbani
                    to = ['belinda.urbani@mailplus.com.au'];
                }

                nlapiSendEmail(from, to, subject, body, cc);

                salesRecord.setFieldValue('custrecord_sales_customer', customerRecordId);
                salesRecord.setFieldValue('custrecord_sales_campaign', 62); //Field Sales
                salesRecord.setFieldValue('custrecord_sales_assigned', salesRep);
                salesRecord.setFieldValue('custrecord_sales_outcome', 5);
                salesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
                var date = new Date();
                salesRecord.setFieldValue('custrecord_sales_callbacktime', nlapiDateToString(date, 'timeofday'));
                nlapiSubmitRecord(salesRecord);
            }

            //Send Email to Customer who filled out the Landing Page Form
            var url = 'https://1048144.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=395&deploy=1&compid=1048144&h=6d4293eecb3cb3f4353e&rectype=customer&template=';
            var template_id = 94;
            var newLeadEmailTemplateRecord = nlapiLoadRecord('customrecord_camp_comm_template', template_id);
            var templateSubject = newLeadEmailTemplateRecord.getFieldValue('custrecord_camp_comm_subject');
            var emailAttach = new Object();
            emailAttach['entity'] = customerRecordId;

            url += template_id + '&recid=' + customerRecordId + '&salesrep=' + salesRep + '&dear=' + full_name + '&contactid=' + null + '&userid=' + encodeURIComponent(nlapiGetContext().getUser());;
            urlCall = nlapiRequestURL(url);
            var emailHtml = urlCall.getBody();

            nlapiSendEmail(112209, email_address, templateSubject, emailHtml, null, null, emailAttach)
        }



        dataOut += '{"ns_id":"' + customerRecordId + '"},';

        dataOut = dataOut.substring(0, dataOut.length - 1);
        dataOut += ']}';
        nlapiLogExecution('DEBUG', 'dataOut', dataOut);
        // dataOut = JSON.parse(dataOut);
        // response.addHeader("Access-Control-Allow-Origin", "*");
        // response.addHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        // response.write(dataOut);
        // 
        var returnObj = {
            success: true,
            message: '',
            result: dataOut
        };

        _sendJSResponse(request, response, returnObj);

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
    }, function(results, status) {
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