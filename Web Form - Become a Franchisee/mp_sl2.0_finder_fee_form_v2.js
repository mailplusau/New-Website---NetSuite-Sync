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

        var ref_first_name = context.request.parameters.ref_first_name;
        var ref_last_name = context.request.parameters.ref_last_name;
        var ref_email_address = context.request.parameters.ref_email;
        var ref_phone_number = context.request.parameters.ref_phone_number;

        var first_name = context.request.parameters.first_name;
        var last_name = context.request.parameters.last_name;
        var email_address = context.request.parameters.email;
        var phone_number = context.request.parameters.phone_number;
        var postcode = context.request.parameters.postcode;
        var comments = context.request.parameters.comments;
        var investor_radio = context.request.parameters.investor_radio;
        var owner_radio = context.request.parameters.owner_radio;
        owner_radio = "true";
        var seeking_employment_radio = context.request.parameters.seeking_employment_radio;
        var residentialpostcode = context.request.parameters.residentialpostcode;
        var vehicle = context.request.parameters.vehicle;
        var experience = context.request.parameters.experience;
        var employment_type = context.request.parameters.employment_type;
        var suburb = context.request.parameters.suburb;
        var pathname = context.request.parameters.pathname;

        var params = {
            ref_first_name: ref_first_name,
            ref_last_name: ref_last_name,
            ref_email: ref_email_address,
            ref_phone_number: ref_phone_number,
            first_name: first_name,
            last_name: last_name,
            email: email_address,
            phone_number: phone_number,
            postcode: postcode,
            comments: comments,
            investor_radio: investor_radio,
            owner_radio: owner_radio,
            seeking_employment_radio: seeking_employment_radio,
            residentialpostcode: residentialpostcode,
            vehicle: vehicle,
            experience: experience,
            employment_type: employment_type,
            suburb: suburb,
            pathname: pathname
        };

        /*
            6	ACT
            1	NSW
            8	NT
            9	NZ
            2	QLD
            4	SA
            5	TAS
            3	VIC
            7	WA
         */

        //Create Franchisee Sales Leads Record
        var zeeLeadRecord = record.create({
            type: 'customrecord_zee_sales_leads'
        });

        zeeLeadRecord.setValue({
            fieldId: 'name',
            value: first_name + ' ' + last_name
        })
        zeeLeadRecord.setValue({
            fieldId: 'custrecord_ref_first_name',
            value: ref_first_name
        })
        zeeLeadRecord.setValue({
            fieldId: 'custrecord_ref_last_name',
            value: ref_last_name
        })
        zeeLeadRecord.setValue({
            fieldId: 'custrecord_ref_phone',
            value: ref_phone_number
        })
        zeeLeadRecord.setValue({
            fieldId: 'custrecord_ref_email',
            value: ref_email_address
        })
        zeeLeadRecord.setValue({
            fieldId: 'custrecord_zee_leads_fname',
            value: first_name
        })
        zeeLeadRecord.setValue({
            fieldId: 'custrecord_zee_leads_lname',
            value: last_name
        })
        zeeLeadRecord.setValue({
            fieldId: 'custrecord_zee_lead_mobile',
            value: phone_number
        })
        zeeLeadRecord.setValue({
            fieldId: 'custrecord_zee_lead_email',
            value: email_address
        })
        zeeLeadRecord.setValue({
            fieldId: 'custrecord_zee_lead_date_entered',
            value: getDate()
        })
        zeeLeadRecord.setValue({
            fieldId: 'custrecord_zee_lead_stage',
            value: 1
        })
        zeeLeadRecord.setValue({
            fieldId: 'custrecord_website_page',
            value: pathname
        })

        if (isNullorEmpty(postcode) && !isNullorEmpty(residentialpostcode)) {
            postcode = residentialpostcode
        }

        zeeLeadRecord.setValue({
            fieldId: 'custrecord_areas_of_interest_postcode',
            value: postcode
        })
        zeeLeadRecord.setValue({
            fieldId: 'custrecord_areas_of_interest_suburb',
            value: suburb
        })


        zeeLeadRecord.setValue({
            fieldId: 'custrecord_type_of_owner',
            value: 3
        })


        if (vehicle != '0' && !isNullorEmpty(vehicle)) {
            zeeLeadRecord.setValue({
                fieldId: 'custrecord_own_a_vehicle',
                value: vehicle
            })
        }

        if (experience != '0' && !isNullorEmpty(experience)) {
            zeeLeadRecord.setValue({
                fieldId: 'custrecord_years_of_experience',
                value: experience
            })
        }

        if (employment_type != '0' && !isNullorEmpty(employment_type)) {
            zeeLeadRecord.setValue({
                fieldId: 'custrecord_type_of_employement',
                value: employment_type
            })
        }

        var sendTo = 'david.gdanski@mailplus.com.au';

        if ((parseInt(postcode) >= 2600 && parseInt(postcode) <= 2618) || (parseInt(
            postcode) >= 2900 && parseInt(postcode) <= 2920)) { //ACT
            zeeLeadRecord.setValue({
                fieldId: 'custrecord_areas_of_interest_state',
                value: 6
            })
        } else if ((parseInt(postcode) >= 2000 && parseInt(postcode) <= 2599) || (
            parseInt(postcode) >= 2619 && parseInt(postcode) <= 2899) || (parseInt(
                postcode) >= 2921 && parseInt(postcode) <= 2999)) { //NSW
            zeeLeadRecord.setValue({
                fieldId: 'custrecord_areas_of_interest_state',
                value: 1
            })
        } else if (parseInt(postcode) >= 3000 && parseInt(postcode) <= 3999) { //VIC
            zeeLeadRecord.setValue({
                fieldId: 'custrecord_areas_of_interest_state',
                value: 3
            })
        } else if (parseInt(postcode) >= 4000 && parseInt(postcode) <= 4999) { //QLD
            zeeLeadRecord.setValue({
                fieldId: 'custrecord_areas_of_interest_state',
                value: 2
            });
            sendTo = 'greg.hart@mailplus.com.au';
        } else if (parseInt(postcode) >= 5000 && parseInt(postcode) <= 5999) { //SA
            zeeLeadRecord.setValue({
                fieldId: 'custrecord_areas_of_interest_state',
                value: 4
            })
        } else if (parseInt(postcode) >= 6000 && parseInt(postcode) <= 6999) { //WA
            zeeLeadRecord.setValue({
                fieldId: 'custrecord_areas_of_interest_state',
                value: 7
            })
        } else if (parseInt(postcode) >= 7000 && parseInt(postcode) <= 7999) { //TAS
            zeeLeadRecord.setValue({
                fieldId: 'custrecord_areas_of_interest_state',
                value: 5
            })
        } else if (parseInt(postcode) >= 800 && parseInt(postcode) <= 999) { //NT
            zeeLeadRecord.setValue({
                fieldId: 'custrecord_areas_of_interest_state',
                value: 8
            })
        }
        zeeLeadRecord.setValue({
            fieldId: 'custrecord_comments',
            value: comments
        })
        zeeLeadRecord.setValue({
            fieldId: 'custrecord_classification',
            value: 5
        })

        var newZeeLeadRecordNSID = zeeLeadRecord.save()

        log.debug({
            title: "params",
            details: JSON.stringify(params)
        });

        var from = 112209; // MailPlus team
        var to;
        var cc = ['ankith.ravindran@mailplus.com.au',
            'michael.mcdaid@mailplus.com.au',
            'luke.forbes@mailplus.com.au'
        ];
        var subject = 'Become a Franchisee Lead';
        var body = 'New Franchisee Enquiry from website';
        body += 'First Name: ' + first_name + '\n';
        body += 'Last Name: ' + last_name + '\n';
        body += 'Email Address: ' + email_address + '\n';
        body += 'Phone Number: ' + phone_number + '\n';
        body += 'Postcode: ' + postcode + '\n';
        body += 'Comments: ' + comments + '\n';

        var userid = encodeURIComponent(runtime.getCurrentUser().id);

        email.send({
            author: 112209,
            body: body,
            recipients: sendTo,
            subject: subject,
            cc: cc
        });

        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_merge_email',
            deploymentId: 'customdeploy_merge_email',
            returnExternalUrl: true
        });


        suiteletUrl += '&rectype=customer&template=128';
        suiteletUrl += '&recid=' + null + '&salesrep=' + null + '&dear=' + '' +
            '&contactid=' + null + '&userid=' + userid + '&zeeleadid=' +
            newZeeLeadRecordNSID;


        log.debug({
            title: 'suiteletUrl',
            details: suiteletUrl
        });

        var response = https.get({
            url: suiteletUrl
        });

        var emailHtml = response.body;

        log.debug({
            title: 'newZeeLeadRecordNSID',
            details: newZeeLeadRecordNSID
        });

        emailHtml.toString().replace("zeeLeadNSID", newZeeLeadRecordNSID);

        log.debug({
            title: 'emailHtml',
            details: emailHtml
        });

        var arrAttachments = [];

        arrAttachments.push(file.load({
            id: 5543283
        }));


        email.send({
            author: 112209,
            body: emailHtml,
            recipients: email_address,
            subject: 'Thank you for your MailPlus enquiry!',
            attachments: arrAttachments
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