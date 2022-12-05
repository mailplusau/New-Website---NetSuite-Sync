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

function portalOrientation(request, response) {
    if (request.getMethod() == "GET") {

        nlapiLogExecution('DEBUG', 'request.getParameter', request.getParameter);

        var account_id = request.getParameter('account_id');
        var customerInternalId = request.getParameter('customerInternalId');
        var company_name = request.getParameter('company_name');
        var first_name = request.getParameter('first_name');
        var last_name = request.getParameter('last_name');
        var email = request.getParameter('email');
        var phone_number = request.getParameter('phone_number');
        var dateVal = request.getParameter('dateVal');
        var timeVal = request.getParameter('timeVal');

        nlapiLogExecution('DEBUG', 'account_id', account_id);
        nlapiLogExecution('DEBUG', 'customerInternalId', customerInternalId);
        nlapiLogExecution('DEBUG', 'company_name', company_name);
        nlapiLogExecution('DEBUG', 'first_name', first_name);
        nlapiLogExecution('DEBUG', 'last_name', last_name);
        nlapiLogExecution('DEBUG', 'email', email);
        nlapiLogExecution('DEBUG', 'phone_number', phone_number);
        nlapiLogExecution('DEBUG', 'dateVal', dateVal);
        nlapiLogExecution('DEBUG', 'timeVal', timeVal);

        var params = {
            account_id: account_id,
            customerInternalId: customerInternalId,
            company_name: company_name,
            first_name: first_name,
            last_name: last_name,
            email: email,
            phone_number: phone_number,
            dateVal: dateVal,
            timeVal: timeVal
        };

        var endTime;
        var timeArray = timeVal.split(':')
        if (timeArray[0] >= 12) {
            timeVal = (parseInt(timeVal[0]) - 12) + ':' + timeArray[1] + ' PM'
            endTime = ((parseInt(timeVal[0]) - 12) + 1) + ':' + timeArray[1] + ' PM'
        } else {
            timeVal = timeVal + ' AM'
            if (timeArray[0] == 11) {
                endTime = '12' + ':' + + timeArray[1] + ' PM'
            } else {
                endTime = (parseInt(timeArray[0]) + 1) + ':' + timeArray[1] + ' AM'
            }
        }

        nlapiLogExecution('DEBUG', 'timeVal', timeVal);
        nlapiLogExecution('DEBUG', 'endTime', endTime);

        var customerRecord = nlapiLoadRecord('customer', customerInternalId);
        customerRecord.setFieldValue('custentity_portal_training_required', 1);
        nlapiSubmitRecord(customerRecord);

        var splitDate = dateVal.split('-');
        var callback_date = splitDate[2] + '/' + splitDate[1] + '/' +
            splitDate[0];

        var notes = 'Call Back Date: ' + callback_date + '. Call Back Time: ' + timeVal;

        var task = nlapiCreateRecord('task');
        task.setFieldValue('title', 'Shipping Portal Orientation');
        task.setFieldValue('assigned', 1706027);
        task.setFieldValue('company', customerInternalId);
        task.setFieldValue('sendemail', 'T');
        task.setFieldValue('timedevent', 'T');
        task.setFieldValue('duedate', callback_date);
        task.setFieldValue('starttime', timeVal);
        task.setFieldValue('endtime', endTime);
        task.setFieldText('remindertype', 'Email');
        task.setFieldText('reminderminutes', '30 minutes')
        task.setFieldValue('message', notes);
        task.setFieldText('status', 'Not Started');
        nlapiSubmitRecord(task);

        var returnObj = {
            success: true,
            message: '',
            result: ''
        };

        _sendJSResponse(request, response, returnObj);

    }

    function _sendJSResponse(request, response, respObject) {
        response.setContentType('JAVASCRIPT');
        // response.setHeader('Access-Control-Allow-Origin', '*');
        var callbackFcn = request.getParameter("jsoncallback") || request.getParameter('callback');
        if (callbackFcn) {
            response.writeLine(callbackFcn + "(" + JSON.stringify(respObject) + ");");
        } else response.writeLine(JSON.stringify(respObject));
    }
}