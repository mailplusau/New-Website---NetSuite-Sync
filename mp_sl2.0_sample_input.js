/**
                             
                             *@NApiVersion 2.x
                             *@NScriptType Suitelet

                            */

define(['N/runtime', 'N/https', 'N/log', 'N/url', 'N/email', 'N/record', 'N/format'],
    function (runtime, https, log, url, email, record, format) {
        function onRequest(context) {

            var role = runtime.getCurrentUser().role;
            var zee = 0;
            var customer_list_page = null;
            if (role == 1000) { // Role is Franchisee
                zee = runtime.getCurrentUser().id; //Get Franchisee ID
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

            var business_name = context.request.parameters.business_name;
            var full_name = context.request.parameters.full_name;
            var email_address = context.request.parameters.email;
            var phone_number = context.request.parameters.phone_number;
            var postcode = context.request.parameters.postcode;
            var avg_daily_shipments = context.request.parameters.avg_daily_shipments;
            var services_of_interest = context.request.parameters.services_of_interest;
            var how_did_you_hear_about_us = context.request.parameters.how_did_you_hear_about_us;

            var params = {
                business_name: business_name,
                full_name: full_name,
                email: email_address,
                phone_number: phone_number,
                postcode: postcode,
                avg_daily_shipments: avg_daily_shipments,
                services_of_interest: services_of_interest,
                how_did_you_hear_about_us: how_did_you_hear_about_us
            };

            log.debug({
                title: "params",
                details: JSON.stringify(params)
            });

            // // build our RESTlet URL
            // var restletUrl = url.resolveScript({
            //     scriptId: 'customscript_res_landing_page',
            //     deploymentId: 'customdeploy1'
            // });

            // log.debug({
            //     title: "restletUrl",
            //     details: restletUrl
            // });

            // // call the RESTlet, in this case, passing a parameter called "sdr_emp_code"
            // var response = https.get({
            //     url: 'https://1048144.restlets.api.netsuite.com' + restletUrl + '&data=' + JSON.stringify(params)
            // });
            // 
            var dataOut = '{"dataOut":[';

            var customerRecord = record.create({
                type: record.Type.LEAD,
                isDynamic: true
            });

            customerRecord.setValue({
                fieldId: 'companyname',
                value: business_name
            });

            customerRecord.setValue({
                fieldId: 'custentity_email_service',
                value: email_address
            });

            customerRecord.setValue({
                fieldId: 'phone',
                value: phone_number
            });

            var quadient = business_name.substring(0, 10);

            if (quadient == 'Quadient -') {
                customerRecord.setValue({
                    fieldId: 'leadsource',
                    value: 246616
                }); //Quadient
            } else {
                customerRecord.setValue({
                    fieldId: 'leadsource',
                    value: 254557
                }); //Inbound - New Website
            }
            customerRecord.setValue({
                fieldId: 'entitystatus',
                value: 57 //Suspect - HOT Lead
            });

            customerRecord.setValue({
                fieldId: 'custentity_hotleads',
                value: true
            });

            customerRecord.setValue({
                fieldId: 'partner',
                value: 435 //MailPlus Pty Ltd

            });
            customerRecord.setValue({
                fieldId: 'custentity_date_lead_entered',
                value: getDate()
            });

            customerRecord.setValue({
                fieldId: 'custentity_lead_entered_by',
                value: 585236 //Portal
            });

            customerRecord.setValue({
                fieldId: 'custentity_industry_category',
                value: 19 //Other
            });

            if (avg_daily_shipments == '1') {
                customerRecord.setValue({
                    fieldId: 'custentity_form_mpex_usage_per_week',
                    value: 1
                });
            } else if (avg_daily_shipments == '2') {
                customerRecord.setValue({
                    fieldId: 'custentity_form_mpex_usage_per_week',
                    value: 2
                });
            } else if (avg_daily_shipments == '3') {
                customerRecord.setValue({
                    fieldId: 'custentity_form_mpex_usage_per_week',
                    value: 3
                });
            }

            if (how_did_you_hear_about_us == '1') {
                customerRecord.setValue({
                    fieldId: 'custentity_how_did_you_hear_about_us',
                    value: 1
                });
            } else if (how_did_you_hear_about_us == '2') {
                customerRecord.setValue({
                    fieldId: 'custentity_how_did_you_hear_about_us',
                    value: 2
                });
            } else if (how_did_you_hear_about_us == '3') {
                customerRecord.setValue({
                    fieldId: 'custentity_how_did_you_hear_about_us',
                    value: 3
                });
            } else if (how_did_you_hear_about_us == '4') {
                customerRecord.setValue({
                    fieldId: 'custentity_how_did_you_hear_about_us',
                    value: 4
                });
            } else if (how_did_you_hear_about_us == '5') {
                customerRecord.setValue({
                    fieldId: 'custentity_how_did_you_hear_about_us',
                    value: 5
                });
            } else {
                customerRecord.setValue({
                    fieldId: 'custentity_how_did_you_hear_about_us',
                    value: 6
                });
            }

            if (services_of_interest == '1') {
                customerRecord.setValue({
                    fieldId: 'custentity_services_of_interest',
                    value: 1
                });
            } else if (services_of_interest == '2') {
                customerRecord.setValue({
                    fieldId: 'custentity_services_of_interest',
                    value: 2
                });
            }

            //ADDRESS

            customerRecord.selectNewLine({
                sublistId: 'addressbook'
            });
            customerRecord.setCurrentSublistValue({
                sublistId: 'addressbook',
                fieldId: 'country',
                value: 'AU'
            });
            customerRecord.setCurrentSublistValue({
                sublistId: 'addressbook',
                fieldId: 'addr1',
                value: ' '
            });
            customerRecord.setCurrentSublistValue({
                sublistId: 'addressbook',
                fieldId: 'addressee',
                value: business_name
            });
            customerRecord.setCurrentSublistValue({
                sublistId: 'addressbook',
                fieldId: 'city',
                value: ' '
            });


            customerRecord.setCurrentSublistValue({
                sublistId: 'addressbook',
                fieldId: 'zip',
                value: postcode
            });
            customerRecord.setCurrentSublistValue({
                sublistId: 'addressbook',
                fieldId: 'state',
                value: formatStateName(postcode)
            });
            customerRecord.commitLine({
                sublistId: 'addressbook'
            });

            var customerRecordId = customerRecord.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });

            //Create CONTACT

            //Split Full name based on Space
            var fullNameSplit = full_name.split(' ');

            var contactRecord = record.create({
                type: record.Type.CONTACT,
                isDynamic: true
            });

            contactRecord.setValue({
                fieldId: 'firstname',
                value: fullNameSplit[0]
            });

            contactRecord.setValue({
                fieldId: 'lastname',
                value: fullNameSplit[1]
            });

            contactRecord.setValue({
                fieldId: 'email',
                value: email_address
            });

            contactRecord.setValue({
                fieldId: 'phone',
                value: phone_number
            });

            contactRecord.setValue({
                fieldId: 'company',
                value: customerRecordId
            });

            contactRecord.setValue({
                fieldId: 'entityid',
                value: full_name
            });

            contactRecord.setValue({
                fieldId: 'contactrole',
                value: -10
            });

            contactRecord.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });

            //Create SALES REP
            var customer_record = record.load({
                type: record.Type.CUSTOMER,
                id: customerRecordId,
                isDynamic: true
            });

            var entity_id = customer_record.getValue({
                fieldId: 'entityid'

            });
            var customer_name = customer_record.getValue({
                fieldId: 'companyname'

            });

            var from = 112209; //MailPlus team
            var to;
            var cc = ['ankith.ravindran@mailplus.com.au'];
            var subject = 'Sales HOT Lead - ' + entity_id + ' ' + customer_name + '';
            var cust_id_link = 'https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' + customerRecordId;
            var body = 'New sales record has been created. \n A HOT Lead has been entered into the System. Please respond in an hour. \n Customer Name: ' + entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;

            var postcode = parseInt(postcode);

            //ACT & NSW Postcodes
            if (postcode >= 2000 && postcode <= 2999) {
                var postcode = parseInt(postcode);
                //Byron Bay Postcodes
                if (postcode == 2481 || postcode == 2482) {
                    to = ['lee.russell@mailplus.com.au'];
                    var salesRep = 668711;

                    //Create Sales Record
                    var recordtoCreate = record.create({
                        type: 'customrecord_sales',
                        isDynamic: true
                    });

                    var date2 = new Date();
                    var userRole = parseInt(runtime.getCurrentUser().role);

                    // Set customer, campaign, user, last outcome, callback date
                    recordtoCreate.setValue({
                        fieldId: 'custrecord_sales_customer',
                        value: customerRecordId
                    });
                    recordtoCreate.setValue({
                        fieldId: 'custrecord_sales_campaign',
                        value: 62
                    });
                    recordtoCreate.setValue({
                        fieldId: 'custrecord_sales_assigned',
                        value: salesRep
                    });
                    recordtoCreate.setValue({
                        fieldId: 'custrecord_sales_outcome',
                        value: 5
                    });
                    recordtoCreate.setValue({
                        fieldId: 'custrecord_sales_callbackdate',
                        value: getDate()
                    });

                    format.format({
                        value: date2.addHours(0),
                        type: format.Type.TIMEOFDAY
                    })
                    recordtoCreate.setValue({
                        fieldId: 'custrecord_sales_callbacktime',
                        value: date2
                    });

                    var val1 = context.request.parameters.campaign_type;


                    if (val1 == 56) {
                        recordtoCreate.setValue({
                            fieldId: 'custrecord_sales_followup_stage',
                            value: 5
                        })
                    }

                    recordtoCreate.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });

                    email.send({
                        author: 112209,
                        body: body,
                        recipients: salesRep, //salesrep
                        subject: 'Sales HOT Lead - ' + entity_id + ' ' + customer_name,
                        cc: ['luke.forbes@mailplus.com.au', 'ankith.ravindran@mailplus.com.au', 'raine.giderson@mailplus.com.au', 'belinda.urbani@mailplus.com.au'],
                    });

                } else {
                    //ACT Post Codes
                    var salesRep = 696160; //Kerina Helliwell
                    to = ['kerina.helliwell@mailplus.com.au'];

                    var recordtoCreate = record.create({
                        type: 'customrecord_sales',
                        isDynamic: true
                    });

                    var date2 = new Date();
                    var userRole = parseInt(runtime.getCurrentUser().role);

                    // Set customer, campaign, user, last outcome, callback date
                    recordtoCreate.setValue({
                        fieldId: 'custrecord_sales_customer',
                        value: customerRecordId
                    });
                    recordtoCreate.setValue({
                        fieldId: 'custrecord_sales_campaign',
                        value: 62
                    });
                    recordtoCreate.setValue({
                        fieldId: 'custrecord_sales_assigned',
                        value: salesRep
                    });
                    recordtoCreate.setValue({
                        fieldId: 'custrecord_sales_outcome',
                        value: 5
                    });
                    recordtoCreate.setValue({
                        fieldId: 'custrecord_sales_callbackdate',
                        value: getDate()
                    });

                    format.format({
                        value: date2.addHours(0),
                        type: format.Type.TIMEOFDAY
                    })
                    recordtoCreate.setValue({
                        fieldId: 'custrecord_sales_callbacktime',
                        value: date2
                    });

                    var val1 = context.request.parameters.campaign_type;


                    if (val1 == 56) {
                        recordtoCreate.setValue({
                            fieldId: 'custrecord_sales_followup_stage',
                            value: 5
                        })
                    }

                    recordtoCreate.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });

                    email.send({
                        author: 112209,
                        body: body,
                        recipients: salesRep, //salesrep
                        subject: 'Sales HOT Lead - ' + entity_id + ' ' + customer_name,
                        cc: ['luke.forbes@mailplus.com.au', 'ankith.ravindran@mailplus.com.au', 'raine.giderson@mailplus.com.au', 'belinda.urbani@mailplus.com.au'],
                    });

                }

            } else { //Everything else

                //Create Sales Record
                var recordtoCreate = record.create({
                    type: 'customrecord_sales',
                    isDynamic: true
                });
                if (postcode >= 3000 && postcode <= 3999) { //VIC Postcodes
                    var salesRep = 690145; //David Gdanski
                    to = ['david.gdanski@mailplus.com.au']
                } else if ((postcode >= 4000 && postcode <= 4999) || (postcode >= 800 && postcode <= 999) || (postcode >= 6000 && postcode <= 6999)) { //QLD & NT Postcodes
                    var salesRep = 668711; //Lee Russell
                    to = ['lee.russell@mailplus.com.au']
                } else if (postcode >= 7000 && postcode <= 7999) { //TAS Postcodes
                    var salesRep = 765724; //Niz Ali
                    to = ['niz.ali@mailplus.com.au']
                } else if (postcode >= 6000 && postcode <= 6999) {
                    to = ['lee.russell@mailplus.com.au', 'kerina.helliwell@mailplus.com.au'];
                    body = 'Dear Kerina & Lee, \n \nA HOT Lead has been entered into the System. Please create a Sales Record to assign it to yourself. \n Customer Name: ' + entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;
                } else { //Everything else
                    var salesRep = 668712; //Belinda Urbani
                    to = ['belinda.urbani@mailplus.com.au'];
                }

                var date2 = new Date();
                var userRole = parseInt(runtime.getCurrentUser().role);

                // Set customer, campaign, user, last outcome, callback date
                recordtoCreate.setValue({
                    fieldId: 'custrecord_sales_customer',
                    value: customerRecordId
                });
                recordtoCreate.setValue({
                    fieldId: 'custrecord_sales_campaign',
                    value: 62
                });
                recordtoCreate.setValue({
                    fieldId: 'custrecord_sales_assigned',
                    value: salesRep
                });
                recordtoCreate.setValue({
                    fieldId: 'custrecord_sales_outcome',
                    value: 5
                });
                recordtoCreate.setValue({
                    fieldId: 'custrecord_sales_callbackdate',
                    value: getDate()
                });

                format.format({
                    value: date2.addHours(0),
                    type: format.Type.TIMEOFDAY
                })
                recordtoCreate.setValue({
                    fieldId: 'custrecord_sales_callbacktime',
                    value: date2
                });

                var val1 = context.request.parameters.campaign_type;


                if (val1 == 56) {
                    recordtoCreate.setValue({
                        fieldId: 'custrecord_sales_followup_stage',
                        value: 5
                    })
                }

                recordtoCreate.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });

                email.send({
                    author: 112209,
                    body: body,
                    recipients: salesRep, //salesrep
                    subject: 'Sales HOT Lead - ' + entity_id + ' ' + customer_name,
                    cc: ['luke.forbes@mailplus.com.au', 'ankith.ravindran@mailplus.com.au', 'raine.giderson@mailplus.com.au', 'belinda.urbani@mailplus.com.au'],
                });

            }

            var suiteletUrl = url.resolveScript({
                scriptId: 'customscript_merge_email',
                deploymentId: 'customdeploy_merge_email',
                returnExternalUrl: true
            });

            log.debug({
                title: "suiteletUrl",
                details: suiteletUrl
            });

            //Send Email to Customer who filled out the Landing Page Form
            suiteletUrl += '&rectype=customer&template=';
            var template_id = 94;
            var newLeadEmailTemplateRecord = record.load({
                type: 'customrecord_camp_comm_template',
                id: template_id,
                isDynamic: true
            });
            var templateSubject = newLeadEmailTemplateRecord.getValue({
                fieldId: 'custrecord_camp_comm_subject'

            });

            var emailAttach = new Object();
            emailAttach['entity'] = customerRecordId;

            suiteletUrl += template_id + '&recid=' + customerRecordId + '&salesrep=' + salesRep + '&dear=' + fullNameSplit[0] + '&contactid=' + null + '&userid=' + salesRep;
            // var headerObj = {
            //     name: 'Accept-Language',
            //     value: 'en-us'
            // };

            log.debug({
                title: "suiteletUrl",
                details: suiteletUrl
            });


            var response = https.get({
                url: suiteletUrl,
            });

            var emailHtml = response.body;

            email.send({
                author: 112209,
                body: emailHtml,
                recipients: email_address,
                subject: templateSubject,
                relatedRecords: emailAttach,
                cc: null,

            });



            dataOut += '{"ns_id":"' + customerRecordId + '"},';

            dataOut = dataOut.substring(0, dataOut.length - 1);
            dataOut += ']}';
            log.debug({
                title: "dataOut",
                details: JSON.parse(dataOut)
            });
            // nlapiLogExecution('DEBUG', 'dataOut', dataOut);

            return JSON.parse(dataOut);
        }

        function formatStateName(postcode) {
            var stateName;
            if ((postcode >= 3000 && postcode <= 3999)) {
                stateName = 'vic';
            } else if (postcode >= 5000 && postcode <= 5999) {
                stateName = 'sa';
            } else if (postcode >= 7000 && postcode <= 7999) {
                stateName = 'tas';
            } else if (postcode >= 4000 && postcode <= 4999) {
                stateName = 'qld';
            } else if (postcode >= 800 && postcode <= 999) {
                stateName = 'nt';
            } else if (postcode >= 6000 && postcode <= 6999) {
                stateName = 'wa';
            } else if (postcode >= 2000 && postcode <= 2999) {
                if ((postcode >= 2600 && postcode <= 2618) || (postcode == 2900) || (postcode == 2920)) {
                    stateName = 'act';
                } else {
                    stateName = 'nsw';
                }

            }

            return stateName.toUpperCase();
        }

        /**
         *  retrieve date
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