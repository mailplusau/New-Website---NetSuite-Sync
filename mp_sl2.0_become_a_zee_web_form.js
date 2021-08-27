    /**
                                         
                                         *@NApiVersion 2.x
                                         *@NScriptType Suitelet

                                        */

    define(['N/runtime', 'N/http', 'N/https', 'N/log', 'N/url', 'N/email', 'N/record', 'N/format'],
        function(runtime, http, https, log, url, email, record, format) {
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

                var first_name = context.request.parameters.first_name;
                var last_name = context.request.parameters.last_name;
                var email_address = context.request.parameters.email;
                var phone_number = context.request.parameters.phone_number;
                var postcode = context.request.parameters.postcode;
                var comments = context.request.parameters.comments;

                var params = {
                    first_name: first_name,
                    last_name: last_name,
                    email: email_address,
                    phone_number: phone_number,
                    postcode: postcode,
                    comments: comments
                };

                log.debug({
                    title: "params",
                    details: JSON.stringify(params)
                });


                var from = 112209; //MailPlus team
                var to;
                var cc = ['ankith.ravindran@mailplus.com.au', 'michael.mcdaid@mailplus.com.au'];
                var subject = 'Become a Franchisee Lead';
                var body = 'New Franchisee Enquiry from website';
                body += 'First Name: ' + first_name + '\n';
                body += 'Last Name: ' + last_name + '\n';
                body += 'Email Address: ' + email_address + '\n';
                body += 'Phone Number: ' + phone_number + '\n';
                body += 'Postcode: ' + postcode + '\n';
                body += 'Comments: ' + comments + '\n';

                email.send({
                    author: 112209,
                    body: body,
                    recipients: 'greg.hart@mailplus.com.au',
                    subject: subject,
                    cc: cc
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
                var callbackFcn = context.request.parameters.jsoncallback || context.request.parameters.callback;
                if (callbackFcn) {
                    context.response.writeLine(callbackFcn + "(" + JSON.stringify(returnObj) + ");")
                } else context.response.writeLine(JSON.stringify(returnObj))

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

            Date.prototype.addHours = function(h) {
                this.setHours(this.getHours() + h);
                return this;
            }

            return {
                onRequest: onRequest
            };
        });