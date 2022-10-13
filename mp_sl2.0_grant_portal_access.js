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

        // var custInternalID = context.request.parameters.custInternalID;
        // var campaign = context.request.parameters.campaign;
        // var custID = context.request.parameters.custID;
        // var custName = context.request.parameters.custName;
        // var custEmail = context.request.parameters.custEmail;

        


        var userJSON = '{';
        userJSON += '"customer_ns_id" : "' + custId + '",'
        userJSON += '"first_name" : "' + contact_first_name + '",'
        userJSON += '"last_name" : "' + contact_last_name + '",'
        userJSON += '"email" : "' + contact_email + '",'
        userJSON += '"phone" : "' + contact_phone + '"'
        userJSON += '}';
        var headers = {};
        headers['Content-Type'] = 'application/json';
        headers['Accept'] = 'application/json';
        headers['x-api-key'] = 'XAZkNK8dVs463EtP7WXWhcUQ0z8Xce47XklzpcBj';

        nlapiRequestURL('https://mpns.protechly.com/new_staff', userJSON,
          headers);

        // var params = {
        //     custInternalID: custInternalID,
        //     campaign: campaign,
        //     custID: custID,
        //     custName: custName,
        //     custEmail: custEmail
        // };

        // var campaignResponse = record.create({
        //     type: record.Type.CAMPAIGN_RESPONSE
        // });

        // campaignResponse.setValue({
        //     fieldId: 'entity',
        //     value: custInternalID
        // })
        // campaignResponse.setValue({
        //     fieldId: 'leadsource',
        //     value: 273237
        // })


        // var campaignResponseID = campaignResponse.save()


        // var returnObj = {
        //     success: true,
        //     message: '',
        //     result: 'Email Sent'
        // };

        // context.response.setHeader({
        //     name: 'Content-Type',
        //     value: 'application/json'
        // });
        // var callbackFcn = context.request.parameters.jsoncallback || context.request
        //     .parameters.callback;
        // if (callbackFcn) {
        //     context.response.writeLine(callbackFcn + "(" + JSON.stringify(returnObj) +
        //         ");")
        // } else
        //     context.response.writeLine(JSON.stringify(returnObj))

    }

    function isNullorEmpty(strVal) {
        return (strVal == null || strVal == '' || strVal == 'null' || strVal ==
            undefined || strVal == 'undefined' || strVal == '- None -' ||
            strVal ==
            '0');
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