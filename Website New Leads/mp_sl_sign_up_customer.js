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

function leadForm(request, response) {
    if (request.getMethod() == "GET") {

        nlapiLogExecution('DEBUG', 'request.getParameter', request);

        var customerRecordId = request.getParameter('customer_internal_id');
        var abn = request.getParameter('abn');
        var business_name = request.getParameter('business_name');
        var first_name = request.getParameter('first_name');
        var last_name = request.getParameter('last_name');
        var email = request.getParameter('email');
        var phone_number = request.getParameter('phone_number');
        var state = request.getParameter('state');


        var pageURL = request.getParameter('pageURL');

        nlapiLogExecution('DEBUG', 'customerRecordId', customerRecordId);
        nlapiLogExecution('DEBUG', 'business_name', business_name);
        nlapiLogExecution('DEBUG', 'abn', abn);
        nlapiLogExecution('DEBUG', 'full_name', first_name);
        nlapiLogExecution('DEBUG', 'full_name', last_name);
        nlapiLogExecution('DEBUG', 'email_address', email);
        nlapiLogExecution('DEBUG', 'phone_number', phone_number);
        nlapiLogExecution('DEBUG', 'pageURL', pageURL);

        var splitPageURL = pageURL.split('https://mailplus.com.au/');

        nlapiLogExecution('DEBUG', 'splitPageURL[0]', splitPageURL[0]);
        nlapiLogExecution('DEBUG', 'splitPageURL[1]', splitPageURL[1]);


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
        var zee_id = customerRecord.getFieldValue('partner');
        var partner_text = customerRecord.getFieldText('partner');

        customerRecord.setFieldValue('companyname', business_name);
        customerRecord.setFieldValue('vatregnumber', abn);
        customerRecord.setFieldValue('custentity_email_service', email);
        customerRecord.setFieldValue('phone', phone_number);

        var quadient = business_name.substring(0, 10);
        nlapiLogExecution('DEBUG', 'business_name', business_name);
        if (quadient == 'Quadient -') {
            customerRecord.setFieldValue('leadsource', 246616); //Quadient
        } else {
            customerRecord.setFieldValue('leadsource', 254557); //Inbound - New Website
        }
        customerRecord.setFieldValue('entitystatus', 13); //Suspect - Hot Lead

        customerRecord.setFieldValue('custentity_mpex_customer', 1);
        customerRecord.setFieldValue('custentity_portal_access', 1);
        customerRecord.setFieldValue('custentity_mpex_invoicing_cycle', 2);

        customerRecord.setFieldValue('entitystatus', 13);

        customerRecord.setFieldValue('custentity_mp_std_activate', 1);
        customerRecord.setFieldValue('custentity_mpex_small_satchel', 1);

        customerRecord.setFieldValue('custentity_cust_closed_won', 'T');

        var customerRecordId = nlapiSubmitRecord(customerRecord);


        // //Create CONTACT

        // var contactRecord = nlapiCreateRecord('contact');
        // contactRecord.setFieldValue('firstname', first_name);
        // contactRecord.setFieldValue('lastname', last_name);
        // contactRecord.setFieldValue('email', email);
        // contactRecord.setFieldValue('phone', phone_number);
        // contactRecord.setFieldValue('company', customerRecordId);
        // contactRecord.setFieldValue('entityid', first_name + ' ' + last_name);
        // contactRecord.setFieldValue('contactrole', -10);
        // // if (subscribe == 'true') {
        // //     contactRecord.setFieldValue('custentity_subscribe_list', 1);
        // // }
        // nlapiSubmitRecord(contactRecord);


        // var note_value = '';
        // note_value += 'Average Daily Shipment: ' + usage_per_week + '/\n';
        // note_value += 'How did you hear about us: ' + hear_about_us + '/\n';
        // note_value += 'Service of Interest: ' + interests + '/\n';

        // var userNoteRecord = nlapiCreateRecord('note');
        // userNoteRecord.setFieldValue('title', 'New Lead');
        // userNoteRecord.setFieldValue('entity', customerRecordId);

        // // userNoteRecord.setFieldValue('direction', $('#direction option:selected').val());
        // // userNoteRecord.setFieldValue('notetype', $('#notetype option:selected').val());
        // userNoteRecord.setFieldValue('note', note_value);
        // userNoteRecord.setFieldValue('author', nlapiGetUser());
        // userNoteRecord.setFieldValue('notedate', getDate());

        // nlapiSubmitRecord(userNoteRecord);

        //Create SALES REP
        var from = 112209; //MailPlus team
        var to;
        var cc = ['luke.forbes@mailplus.com.au', 'belinda.urbani@mailplus.com.au',
            'ankith.ravindran@mailplus.com.au'
        ];
        var subject = 'Sales HOT Lead - ' + entity_id + ' ' + business_name + '';
        var cust_id_link =
            'https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' +
            customerRecordId;
        var body =
            'New sales record has been created. \n A HOT Lead has been entered into the System. Please respond in an hour. \n Customer Name: ' +
            entity_id + ' ' + business_name + '\nLink: ' + cust_id_link;

        var postcode = parseInt(postcode);


        var salesRecord = nlapiCreateRecord('customrecord_sales');
        var salesRep = 112209; //MailPlus team

        salesRecord.setFieldValue('custrecord_sales_customer',
            customerRecordId);
        salesRecord.setFieldValue('custrecord_sales_campaign', 62); //Field Sales
        salesRecord.setFieldValue('custrecord_sales_assigned', salesRep);
        salesRecord.setFieldValue('custrecord_sales_outcome', 5);
        salesRecord.setFieldValue('custrecord_sales_callbackdate', getDate());
        var date = new Date();
        salesRecord.setFieldValue('custrecord_sales_callbacktime',
            nlapiDateToString(date, 'timeofday'));
        var sales_record_id = nlapiSubmitRecord(salesRecord);

        customer_comm_reg = nlapiCreateRecord('customrecord_commencement_register');
        customer_comm_reg.setFieldValue('custrecord_date_entry', getDate());
        customer_comm_reg.setFieldValue('custrecord_comm_date', getDate());
        customer_comm_reg.setFieldValue('custrecord_comm_date_signup', getDate());
        customer_comm_reg.setFieldValue('custrecord_customer', customerRecordId);
        customer_comm_reg.setFieldValue('custrecord_salesrep', salesRep);
        customer_comm_reg.setFieldValue('custrecord_franchisee', zee_id);
        customer_comm_reg.setFieldValue('custrecord_wkly_svcs', '5');
        customer_comm_reg.setFieldValue('custrecord_in_out', 1);
        customer_comm_reg.setFieldValue('custrecord_trial_status', 2);
        customer_comm_reg.setFieldValue('custrecord_state', state_id);
        customer_comm_reg.setFieldValue('custrecord_sale_type', 1);
        customer_comm_reg.setFieldValue('custrecord_finalised_by', 112209);
        customer_comm_reg.setFieldValue('custrecord_finalised_on', getDate());
        customer_comm_reg.setFieldValue('custrecord_commreg_sales_record',
            sales_record_id);

        var commRegId = nlapiSubmitRecord(customer_comm_reg);


        var phonecall = nlapiCreateRecord('phonecall');
        phonecall.setFieldValue('assigned', zee_id);
        phonecall.setFieldValue('custevent_organiser', 112209);
        phonecall.setFieldValue('startdate', getDate());
        phonecall.setFieldValue('company', customerRecordId);
        phonecall.setFieldValue('status', 'COMPLETE');
        phonecall.setFieldValue('custevent_call_outcome', 16);
        phonecall.setFieldValue('title', 'X Sale - Website Lead - Signed');
        nlapiSubmitRecord(phonecall);

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
        new_service_change_record.setFieldValue('custrecord_servicechg_created', 112209);
        new_service_change_record.setFieldValue('custrecord_servicechg_type', 'MPEX Customer');
        new_service_change_record.setFieldValue('custrecord_default_servicechg_record', 1);
        nlapiSubmitRecord(new_service_change_record);



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

        nlapiSendEmail(112209, ['mailplussupport@protechly.com'],
            email_subject, email_body, ['mj@roundtableapps.com',
            'ankith.ravindran@mailplus.com.au'
        ], null, records, null, true);

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


        //Search for Contacts
        var searchedContacts = nlapiLoadSearch('contact',
            'customsearch_salesp_contacts');

        var newFilters = new Array();
        newFilters[newFilters.length] = new nlobjSearchFilter('company', null, 'is',
            customerRecordId);
        newFilters[newFilters.length] = new nlobjSearchFilter('email', null, 'is',
            email);

        searchedContacts.addFilters(newFilters);

        var resultSetContacts = searchedContacts.runSearch();

        var contact_id = null;
        resultSetContacts.forEachResult(function (searchResultContacts) {
            contact_id = searchResultContacts.getValue('internalid');

            return true;
        });

        //Send Email to Customer who filled out the Landing Page Form
        var url =
            'https://1048144.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=395&deploy=1&compid=1048144&h=6d4293eecb3cb3f4353e&rectype=customer&template=';
        var template_id = 59;
        var newLeadEmailTemplateRecord = nlapiLoadRecord(
            'customrecord_camp_comm_template', template_id);
        var templateSubject = newLeadEmailTemplateRecord.getFieldValue(
            'custrecord_camp_comm_subject');
        var emailAttach = new Object();
        emailAttach['entity'] = customerRecordId;

        url += template_id + '&recid=' + customerRecordId + '&salesrep=' +
            salesRep + '&dear=' + first_name + '&contactid=' + contact_id + '&userid=' +
            encodeURIComponent(nlapiGetContext().getUser());;
        urlCall = nlapiRequestURL(url);
        var emailHtml = urlCall.getBody();

        nlapiSendEmail(112209, email, templateSubject, emailHtml, null,
            null, emailAttach)


        var status = nlapiScheduleScript(
            'customscript_ss_sync_prod_pricing_mappin', 'customdeploy2', null
        );
        nlapiLogExecution('DEBUG', 'status', status);
        if (status == 'QUEUED') {
            return false;
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
