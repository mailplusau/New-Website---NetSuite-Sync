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

        var entityid = context.request.parameters.entityid;

        //Search Name: Active Customers - Status Signed V3
        var activeCustomerListSignedSearch = search.load({
            type: 'customer',
            id: 'customsearch_active_customers_2'
        });

        activeCustomerListSignedSearch.filters.push(search.createFilter({
            name: 'entityid',
            join: null,
            operator: search.Operator.IS,
            values: entityid
        }));

        var custInternalID;
        var custEntityID;
        var custName;

        activeCustomerListSignedSearch.run().each(function (
            searchResult) {

            custInternalID = searchResult.getValue({
                name: 'internalid'
            });
            custEntityID = searchResult.getValue({
                name: 'entityid'
            });
            custName = searchResult.getValue({
                name: 'companyname'
            });


            return true;
        });


        var returnObj = {
            success: true,
            message: 'Customer Found',
            result: 'Customer Found',
            custInternalID: custInternalID,
            custName: custName
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