/**
 * Module Description
 *
 * NSVersion    Date                    Author
 * 1.00         2022-10-12 16:42:05     Ankith
 *
 * Remarks: API to grant portal access to user
 *
 * @Last modified by:   ankithravindran
 * @Last modified time: 2022-02-10T16:53:35+11:00
 *
 */

var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://system.sandbox.netsuite.com';
}

var zee = 0;
var role = nlapiGetRole();

if (role == 1000) {
    zee = nlapiGetUser();
} else if (role == 3) { //Administrator
    zee = 6; //test
} else if (role == 1032) { // System Support
    zee = 425904; //test-AR
}

function grantPortalAccess(request, response) {

    var custInternalID = request.getParameter('custInternalID');
    var custID = request.getParameter('custID');
    var custEmail = request.getParameter('custEmail');
    var firstName = request.getParameter('firstName');
    var lastName = request.getParameter('lastName');

    var phone = request.getParameter('phone');

    var full_name = firstName + ' ' + lastName

    var userJSON = '{';
    userJSON += '"customer_ns_id" : "' + custInternalID + '",'
    userJSON += '"first_name" : "' + firstName + '",'
    userJSON += '"last_name" : "' + lastName + '",'
    userJSON += '"email" : "' + custEmail + '",'
    userJSON += '"phone" : "' + phone + '"'
    userJSON += '}';
    var headers = {};
    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'application/json';
    headers['x-api-key'] = 'XAZkNK8dVs463EtP7WXWhcUQ0z8Xce47XklzpcBj';

    var response = nlapiRequestURL('https://mpns.protechly.com/new_staff', userJSON,
        headers);

    nlapiLogExecution('DEBUG', 'response', response);

    var websiteSubscribeorPortalContactsRecord = nlapiCreateRecord('customrecord_website_subscribe_contacts');

    websiteSubscribeorPortalContactsRecord.setFieldValue('name', full_name)
    websiteSubscribeorPortalContactsRecord.setFieldValue('custrecord_full_name', full_name)
    websiteSubscribeorPortalContactsRecord.setFieldValue('custrecord_email', custEmail)
    websiteSubscribeorPortalContactsRecord.setFieldValue('custrecord_phone_number', phone)
    websiteSubscribeorPortalContactsRecord.setFieldValue('custrecord_related_customer', custInternalID)
    websiteSubscribeorPortalContactsRecord.setFieldValue('custrecord_portal_access_requested', 1)

    nlapiSubmitRecord(websiteSubscribeorPortalContactsRecord)

}