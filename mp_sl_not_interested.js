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

function notInterested(request, response) {
    if (request.getMethod() == "GET") {

        nlapiLogExecution('DEBUG', 'request.getParameter', request.getParameter);

        var customerRecordId = request.getParameter('customer_internal_id');
        var company_name = request.getParameter('company_name');
        var feedback = request.getParameter('feedback');

        var params = {
            customerRecordId: customerRecordId,
            company_name: company_name,
            feedback: feedback
        }

        nlapiLogExecution('DEBUG', 'customerRecordId', customerRecordId);
        nlapiLogExecution('DEBUG', 'company_name', company_name);
        nlapiLogExecution('DEBUG', 'feedback', feedback);

        var userNoteRecord = nlapiCreateRecord('note');
        userNoteRecord.setFieldValue('title', 'Not Interested Reason');
        userNoteRecord.setFieldValue('entity', customerRecordId);

        // userNoteRecord.setFieldValue('direction', $('#direction option:selected').val());
        // userNoteRecord.setFieldValue('notetype', $('#notetype option:selected').val());
        userNoteRecord.setFieldValue('note', feedback);
        userNoteRecord.setFieldValue('author', nlapiGetUser());
        userNoteRecord.setFieldValue('notedate', getDate());

        nlapiSubmitRecord(userNoteRecord);


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

function getDate() {
    var date = new Date();
    if (date.getHours() > 6) {
        date = nlapiAddDays(date, 1);
    }
    date = nlapiDateToString(date);
    return date;
}