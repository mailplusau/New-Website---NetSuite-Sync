/**
 * Author:               Ankith Ravindran
 * Created on:           2024-01-23T03:37:13.614Z
 * Modified on:        ` 2024-01-23T03:37:08.050Z
 * SuiteScript Version:  1.0 
 * Description:          Suitelet to create a new LPO Owner lead after the form is filled in the LPO Owner Information Page 
 *
 * Copyright (c) 2024 MailPlus Pty. Ltd.
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

        var business_name = request.getParameter('business_name');
        var lpo_owner_name = request.getParameter('lpo_owner_name');
        var email = request.getParameter('email');
        var phone_number = request.getParameter('phone_number');
        var address1 = request.getParameter('address1');
        var address2 = request.getParameter('address2');
        var city = request.getParameter('city');
        var state = request.getParameter('state');
        var postcode = request.getParameter('postcode');
        var lat = request.getParameter('lat');
        var lng = request.getParameter('lng');
        var lpo_notes = request.getParameter('notes');
        var pageURL = request.getParameter('pageURL');

        nlapiLogExecution('DEBUG', 'business_name', business_name);
        nlapiLogExecution('DEBUG', 'lpo_owner_name', lpo_owner_name);
        nlapiLogExecution('DEBUG', 'email_address', email);
        nlapiLogExecution('DEBUG', 'phone_number', phone_number);
        nlapiLogExecution('DEBUG', 'address1', address1);
        nlapiLogExecution('DEBUG', 'address2', address2);
        nlapiLogExecution('DEBUG', 'city', city);
        nlapiLogExecution('DEBUG', 'state', state);
        nlapiLogExecution('DEBUG', 'postcode', postcode);
        nlapiLogExecution('DEBUG', 'lat', lat);
        nlapiLogExecution('DEBUG', 'lng', lng);
        nlapiLogExecution('DEBUG', 'pageURL', pageURL);

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



        //NEW CUSTOMER RECORD
        var dataOut = '{"dataOut":[';

        //If Post code is empty, do not create a record on NetSuite
        if (isNullorEmpty(postcode)) {
            dataOut += '{"ns_id":"ADDRESS ERROR - Empty Post Code"},';
        } else {

            var lpoLeadrecord = nlapiCreateRecord('customrecord_lpo_lead_form');

            lpoLeadrecord.setFieldValue('custrecord_lpo_lead_name', business_name);
            lpoLeadrecord.setFieldValue('custrecord_lpo_lead_contact_name', lpo_owner_name);
            lpoLeadrecord.setFieldValue('custrecord_lpo_lead_contact_email', email);
            lpoLeadrecord.setFieldValue('custrecord_lpo_lead_contact_number', phone_number);
            lpoLeadrecord.setFieldValue('custrecord_lpo_lead_notes', lpo_notes);
            lpoLeadrecord.setFieldValue('custrecord_lpo_lead_st_num_name', address2);
            lpoLeadrecord.setFieldValue('custrecord_lpo_lead_address_level', address1);
            lpoLeadrecord.setFieldValue('custrecord_lpo_lead_address_suburb', city);
            lpoLeadrecord.setFieldValue('custrecord_lpo_lead_address_state', state_id);
            lpoLeadrecord.setFieldValue('custrecord_lpo_lead_address_postcode', postcode);
            lpoLeadrecord.setFieldValue('custrecord_lpo_lead_status', 1);


            var lpoLeadRecordID = nlapiSubmitRecord(lpoLeadrecord);

            // Email to be sent out to Corrine about the new LPO Lead.
            var from = 112209; //MailPlus team
            var to = ['corinne.jackson@mailplus.com.au'];
            var cc = ['chris.burgess@mailplus.com.au', 'michael.mcdaid@mailplus.com.au', 'alexandra.bathman@mailplus.com.au'];
            var emailSubject = 'New LPO Owner Lead - ' + business_name;

            var emailBody = '';
            var cust_id_link =
                'https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1844&deploy=1&lpoleadid=' + lpoLeadRecordID;
            var body =
                'New LPO Owner lead has been created in NetSuite. \n LPO Name: ' +
                business_name + '\nLink: ' + cust_id_link;
            nlapiSendEmail(from, to, emailSubject, body, cc);


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
