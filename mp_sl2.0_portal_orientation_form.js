/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @Author: Ankith Ravindran <ankithravindran>
 * @Date:   2021-09-15T17:02:45+10:00
 * @Filename: mp_sl2.0_become_a_zee_web_form_v2.js
 * @Last modified by:   ankithravindran
 * @Last modified time: 2022-03-18T14:46:10+11:00
 */



define(['N/runtime', 'N/http', 'N/https', 'N/log', 'N/url', 'N/email',
    'N/record', 'N/format', 'N/file'
], function (runtime, http, https, log,
    url, email, record, format, file) {
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

        var account_id = context.request.parameters.account_id;
        var customerInternalId = context.request.parameters.customerInternalId;
        var company_name = context.request.parameters.company_name;
        var first_name = context.request.parameters.first_name;
        var last_name = context.request.parameters.last_name;
        var email = context.request.parameters.email;
        var phone_number = context.request.parameters.phone_number;

        var dateVal = context.request.parameters.dateVal;
        var timeVal = context.request.parameters.timeVal;

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

        var customerRecord = record.load({
            type: record.Type.CUSTOMER,
            id: customerInternalId,
            isDynamic: true
        });
        customerRecord.setValue({
            fieldId: 'custentity_portal_training_required',
            value: 1
        });

        customerRecord.save({
            ignoreMandatoryFields: true
        });

        // var task_record = record.create({
        //     type: record.Type.TASK,
        //     id: customerInternalId,
        //     isDynamic: true
        // });

        var task_record = record.create({
            type: 'calendarevent'
        });

        log.debug({
            title: "dateVal",
            details: dateVal
        });

        var splitDate = dateVal.split('-');
        // var nsDate = dateISOToNetsuite(dateVal);
        // log.debug({
        //     title: "nsDate",
        //     details: nsDate
        // });
        var callback_date = splitDate[2] + '/' + splitDate[1] + '/' +
            splitDate[0];

        var parsedDateStringAsRawDateObject = format.parse({
            value: callback_date,
            type: format.Type.DATE
        });
        var formattedDateString = format.format({
            value: parsedDateStringAsRawDateObject,
            type: format.Type.DATE
        });

        log.debug({
            title: "formattedDateString",
            details: formattedDateString
        });

        log.debug({
            title: "callback_date",
            details: callback_date.toString()
        });

        log.debug({
            title: "timeVals",
            details: timeVal
        });

        task_record.setValue({
            fieldId: 'startdate',
            value: callback_date
        });
        task_record.setValue({
            fieldId: 'starttime',
            value: timeVal
        });
        task_record.setValue({
            fieldId: 'remindertype',
            value: 'Email'
        });
        task_record.setValue({
            fieldId: 'reminderminutes',
            value: '1 hour'
        });
        task_record.setValue({
            fieldId: 'timedevent',
            value: 'T'
        });
        task_record.setValue({
            fieldId: 'company',
            value: customerInternalId
        });
        task_record.setValue({
            fieldId: 'status',
            value: 'Not Started'
        });
        task_record.setValue({
            fieldId: 'title',
            value: 'Shipping Portal Orientation'
        });

        task_record.setValue({
            fieldId: 'assigned',
            value: 409635
        });


        task_record.save({
            ignoreMandatoryFields: true
        });


        var returnObj = {
            success: true,
            message: '',
            result: 'Email Sent'
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

    Date.prototype.addHours = function (h) {
        this.setHours(this.getHours() + h);
        return this;
    }

    return {
        onRequest: onRequest
    };
});