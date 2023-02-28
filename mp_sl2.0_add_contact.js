/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @Author: Ankith Ravindran <ankithravindran>
 * @Last modified by:   ankithravindran
 * @Last modified time: 2022-03-18T14:46:10+11:00
 */


define(['N/runtime', 'N/http', 'N/https', 'N/log', 'N/url', 'N/email',
    'N/record', 'N/format', 'N/file', 'N/search'
], function (runtime, http, https, log,
    url, email, record, format, file, search) {
    function onRequest(context) {

        var role = runtime.getCurrentUser().role;
        var zee = 0;
        var customer_list_page = null;
        if (role == 1000) { // Role is Franchisee
            zee = runtime.getCurrentUser().id; // Get Franchisee ID
        } else {
            zee = 0;
        }

        log.debug({
            title: "context.request.method",
            details: context.request.method
        });
        log.debug({
            title: "context.request",
            details: context.request
        });
        log.debug({
            title: "context.request.parameters",
            details: context.request.parameters
        });

        var customerId = context.request.parameters.customer_internal_id;
        var firstName = context.request.parameters.first_name;
        var lastName = context.request.parameters.last_name;
        var email = context.request.parameters.email;
        var phone = context.request.parameters.phone_number;

        var newContactId = _saveNewContact(customerId, firstName, lastName, email, phone);

        //Search Name: All Sales Record - Get Sales Rep Details
        var allSalesRecordSearch = search.load({
            type: 'customrecord_sales',
            id: 'customsearch_sales_record_auto_signed__2'
        });

        allSalesRecordSearch.filters.push(search.createFilter({
            name: 'internalid',
            join: 'custrecord_sales_customer',
            operator: search.Operator.IS,
            values: customer_internal_id
        }));

        var alesRepEmail;
        var salesRepId;
        var salesRepName;

        allSalesRecordSearch.run().each(function (
            searchResult) {

            salesRepEmail = searchResult.getValue({
                name: 'email',
                join: 'CUSTRECORD_SALES_ASSIGNED'
            });
            salesRepId = searchResult.getValue({
                name: 'custrecord_sales_assigned'
            });
            salesRepName = searchResult.getValue({
                name: 'custrecord_sales_assigned'
            });
            return true;
        });

        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_merge_email',
            deploymentId: 'customdeploy_merge_email',
            returnExternalUrl: true
        });

        suiteletUrl += '&rectype=customer&template=59';
        suiteletUrl += '&recid=' + customer_internal_id + '&salesrep=' + salesRepId + '&dear=' + '' + '&contactid=' + newContactId + '&userid=' + salesRepId;

        var response = https.get({
            url: suiteletUrl
        });

        var emailHtml = response.body;
        var subject = 'Create your free MailPlus account now!'

        email.send({
            author: salesRepId,
            body: emailHtml,
            recipients: email,
            subject: subject,
            cc: salesRepEmail,
            relatedRecords: { entityId: customer_id }
        });


        var returnObj = {
            success: true,
            message: 'Contact Created',
            result: 'Contact Created',
            newContactId: newContactId
        };

        context.response.setHeader({
            name: 'Content-Type',
            value: 'application/json'
        });
        var callbackFcn = context.request.parameters.jsoncallback || context.request
            .parameters.callback;
        if (callbackFcn) {
            context.response.writeLine(callbackFcn + "(" + JSON.stringify(returnObj) +
                ");")
        } else
            context.response.writeLine(JSON.stringify(returnObj))

    }

    function isNullorEmpty(strVal) {
        return (strVal == null || strVal == '' || strVal == 'null' || strVal ==
            undefined || strVal == 'undefined' || strVal == '- None -' ||
            strVal ==
            '0');
    }

    function dateISOToNetsuite(date_iso) {
        var date_netsuite = '';
        if (!isNullorEmpty(date_iso)) {
            var date_utc = new Date(date_iso);
            // var date_netsuite = nlapiDateToString(date_utc);
            var date_netsuite = format.format({
                value: date_utc,
                type: format.Type.DATE
            });
        }
        return date_netsuite;
    }


    /**
     * retrieve date
     */
    function getDate() {
        var date = new Date();
        if (date.getHours() > 6) {
            date.setDate(date.getDate() + 1);
        }

        format.format({
            value: date,
            type: format.Type.DATE,
            timezone: format.Timezone.AUSTRALIA_SYDNEY
        })

        return date;
    }

    function _saveNewContact(customerId, firstName, lastName, email, phone) {

        var contactRecord = record.create({
            type: record.Type.CONTACT,
        });

        contactRecord.setValue({ fieldId: 'company', value: customerId });
        contactRecord.setValue({ fieldId: 'entityid', value: firstName + ' ' + lastName });
        contactRecord.setValue({ fieldId: 'firstname', value: firstName });
        contactRecord.setValue({ fieldId: 'lastname', value: lastName });
        contactRecord.setValue({ fieldId: 'email', value: email });
        contactRecord.setValue({ fieldId: 'phone', value: phone });
        contactRecord.setValue({ fieldId: 'contactrole', value: 8 });

        var contactId = contactRecord.save({ ignoreMandatoryFields: true });

        return contactId;
    }

    Date.prototype.addHours = function (h) {
        this.setHours(this.getHours() + h);
        return this;
    }

    return {
        onRequest: onRequest
    };
});

