/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet

 * Author:               Ankith Ravindran
 * Created on:           Tue Jul 30 2024
 * Modified on:          Tue Jul 30 2024 12:58:00
 * SuiteScript Version:  2.0 
 * Description:          Page to display the list of items the user can order. 
 *
 * Copyright (c) 2024 MailPlus Pty. Ltd.
 */

define([
	"N/ui/serverWidget",
	"N/email",
	"N/runtime",
	"N/search",
	"N/record",
	"N/http",
	"N/log",
	"N/redirect",
	"N/format",
], function (ui, email, runtime, search, record, http, log, redirect, format) {
	var role = 0;
	var userId = 0;
	var zee = 0;

	function onRequest(context) {
		var baseURL = "https://system.na2.netsuite.com";
		if (runtime.EnvType == "SANDBOX") {
			baseURL = "https://system.sandbox.netsuite.com";
		}
		userId = runtime.getCurrentUser().id;
		role = runtime.getCurrentUser().role;

		if (context.request.method === "GET") {
			var customerInternalId = context.request.parameters.custinternalid;

			var form = ui.createForm({
				title: "Accept Terms & Conditions",
			});

			//HEADER LINKS & SCRIPTS
			var inlineHtml =
				'<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/2.0.7/css/dataTables.dataTables.css"><link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/buttons/3.0.2/css/buttons.dataTables.css"><script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/2.0.7/js/dataTables.js"></script><script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/buttons/3.0.2/js/dataTables.buttons.js"></script><script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/buttons/3.0.2/js/buttons.dataTables.js"></script><script type="text/javascript" charset="utf8" src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script><script type="text/javascript" charset="utf8" src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js"></script><script type="text/javascript" charset="utf8" src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js"></script><script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/buttons/3.0.2/js/buttons.html5.min.js"></script><script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/buttons/3.0.2/js/buttons.print.min.js"></script><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA92XGDo8rx11izPYT7z2L-YPMMJ6Ih1s0&callback=initMap&libraries=places"></script><link rel="stylesheet" href="https://system.na2.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://system.na2.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://system.na2.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><script src="https://cdn.datatables.net/searchpanes/1.2.1/js/dataTables.searchPanes.min.js"><script src="https://cdn.datatables.net/select/1.3.3/js/dataTables.select.min.js"></script>';
			inlineHtml +=
				'<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" /><script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>';
			inlineHtml +=
				'<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/css/bootstrap-select.min.css">';
			inlineHtml +=
				'<script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/bootstrap-select.min.js"></script>';
			// Semantic Select
			inlineHtml +=
				'<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.13/semantic.min.css">';
			inlineHtml +=
				'<script src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.13/semantic.min.js"></script>';
			inlineHtml +=
				'<link href="https://use.fontawesome.com/releases/v5.0.1/css/all.css" rel="stylesheet">';

			inlineHtml +=
				'<style>.mandatory{color:red;} .body{background-color: #CFE0CE !important;font-family: "objectsans-regular" !important;}.wrapper{position:fixed;height:2em;width:2em;overflow:show;margin:auto;top:0;left:0;bottom:0;right:0;justify-content: center; align-items: center; display: -webkit-inline-box;} .ball{width: 22px; height: 22px; border-radius: 11px; margin: 0 10px; animation: 2s bounce ease infinite;} .blue{background-color: #0f3d39; }.red{background-color: #095C7B; animation-delay: .25s;}.yellow{background-color: #387081; animation-delay: .5s}.green{background-color: #d0e0cf; animation-delay: .75s}@keyframes bounce{50%{transform: translateY(25px);}}.select2-selection__choice{ background-color: #095C7B !important; color: white !important}.select2-selection__choice__remove{color: red !important;} .footer_links{font-family: \'Open Sans\'; text-decoration: none; color: white !important;} .bg-dark{background: #095c7b;color: #ffffff;} .footer-6{padding-top: 6.428571em !important;font-size: 12px !important; line-height: 27px !important;} .nav{ display: flex !important; justify-content: space-between !important; align-items: center !important; padding: 20px !important; background-color: #095c7b !important; color: #ffffff !important;} .nav-links{ list-style: none !important; display: flex !important; color: #ffffff !important;}.nav-links li{ margin-right: 20px !important; color: #ffffff !important;} .nav-links.right{ } .logo{ flex: 0 0 auto !important; } .logo{max-height: 40px !important;} .logo-holder{position: relative; text-align: center;} .btn{text-decoration: none;} .btn-bg2{background-color: #F0AECB; border-radius: 30px; margin-left: 0px !important;} .card{ box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2); transition: 0.3s;}.card:hover{ box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);} .container{ padding: 2px 16px;} .card{ box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2); transition: 0.3s; border-radius: 20px; } .class_img{ border-radius: 15px 15px 15px 15px;} .page-header-text { font-size: 40px !important; }.color--primary-1 { color: #095c7b !important;}.page-body-text { font-size: 24px !important; }.color--primary-2 { color: #103d39 !important;} .card-header-text { font-size: 20px !important; } .card-header-price { font-size: 15px !important; } .get-in-touch-button { background-color: #EAF044 !important; border-radius: 30px; color: #103d39 !important; border-color: #EAF044; padding: 10px !important; font-size: 15px !important;} .btn-block { display: initial; width: 25% !important; }.lift { -webkit-transition: box-shadow .25s ease, -webkit-transform .25s ease; transition: box-shadow .25s ease, -webkit-transform .25s ease; transition: box-shadow .25s ease, transform .25s ease; transition: box-shadow .25s ease, transform .25s ease, -webkit-transform .25s ease;} .badge{ font-size: 25px !important; line-height: 0px !important; /* color: transparent; */ background-color: transparent !important;} .badge:after { content: attr(value); font-size: 15px; color: #095c7b; background: #EAF044; border-radius: 30px; padding: 5px; position: relative; left: -8px; top: -10px; font-family: "objectsans-regular" !important;} .add_to_cart{cursor: pointer;}.pqt-minus,.pqt-plus{background:#fff;border:none;font-size:20px;padding:0 20px;width:50px;border-radius:10px;height:50px;user-select:none;line-height:50px;vertical-align: middle;}.pqt-minus:hover,.pqt-plus:hover{background:#095c7b;color:#fff;cursor:pointer} .added_to_cart { background-color: #F0AECB !important; border-radius: 30px; color: #103d39 !important; border-color: #F0AECB; padding: 10px !important; font-family: "objectsans-bold" !important; font-size: 15px !important;width:25%; border: 0px !important;vertical-align: middle;} .cart-pqt-minus,.cart-pqt-plus{background:#fff;border:none;font-size:12px;padding:0 20px;border-radius:10px;user-select:none;line-height:25px;vertical-align: middle;}.cart-pqt-minus:hover,.cart-pqt-plus:hover{background:#095c7b;color:#fff;cursor:pointer} .cart-remove-item{background:#fff;border:none;font-size:12px;padding:0 20px;border-radius:10px;user-select:none;line-height:25px;vertical-align: middle;} .cart-remove-item:hover{background:#F05A7E;color:#fff;cursor:pointer} </style>';

			//HEADER NAVBAR
			inlineHtml +=
				'<div class="container nav" style="width: 100%"> <div class="col-xs-4"><ul class="nav-links"> <li><a href="#" style="color: #ffffff !important;font-size: 1.25em;">Our Service</a></li> <li><a href="#" style="color: #ffffff !important;font-size: 1.25em;">Tracking</a></li> <li><a href="#" style="color: #ffffff !important;font-size: 1.25em;">For Small Business</a></li> </ul></div> <div class="logo-holder col-xs-4"> <img src="https://mailplus.com.au/wp-content/uploads/2021/02/mailplus-new-logo-solo-copy-4.png" alt="Company Logo" class="logo"> </div> <div class="col-xs-4" style="text-align: right;"></div> </div>';

			//BODY
			//ADD SPACING
			inlineHtml +=
				'<div class="vc_empty_space" style="height: 50px"><span class="vc_empty_space_inner"></span></div>';

			inlineHtml +=
				'<div class="container"><div class="row"><div class="textwidget"><h2 class="color--primary-1 page-header-text" style="text-align: center; margin-bottom: 20px !important; line-height: 42px !important;"><strong>Please Accept the Terms & Conditions</strong></h2><h3 class="color--primary-2 page-body-text" style="text-align: center; line-height: 27px !important;">Simply click the button below and services can begin and/or continue. </br>To read the T&Cs, please click this link: <a href="https://mailplus.com.au/terms-conditions/" style="font-family: "objectsans-regular" !important;" target="_blank">Terms & Conditions.</a></h3></br></div></div></div>';

			//ADD SPACING
			inlineHtml +=
				'<div class="vc_empty_space" style="height: 50px"><span class="vc_empty_space_inner"></span></div>';

			inlineHtml +=
				'<div class="form-group container view_cart_buttons_section hide">';
			inlineHtml += '<div class="row">';
			inlineHtml += '<div class="col-xs-3"></div>';
			inlineHtml +=
				'<div class="col-xs-6"><input type="button" value="ACCEPT" class="form-control btn btn-primary acceptTNC" id="" style="background-color: #F0AECB; border-radius: 30px; color: #103d39 !important;" /></div>';

			inlineHtml += '<div class="col-xs-3"></div>';

			inlineHtml += "</div>";
			inlineHtml += "</div>";

			inlineHtml +=
				'<div class="vc_empty_space" style="height: 50px"><span class="vc_empty_space_inner"></span></div>';

			//FOOTER
			inlineHtml +=
				'<footer class="bg-dark footer-6" style=""><div class="container" style="width: 95% !important;"> <div class="row"> <div class="col-sm-6 col-md-5 col-xs-12"> <div id="media_image-3" class="widget widget_media_image sidebar__element"> <style> .widget.widget_media_image img {height: auto; max-width: 100%; } </style><img width="126" height="45" src="https://mailplus.com.au/wp-content/uploads/2021/02/mailplus-new-logo-solo-copy-4.png" class="image wp-image-63  attachment-full size-full" alt="" loading="lazy" style="max-width: 100%; height: auto;" data-attachment-id="63" data-permalink="https://mailplus.com.au/202-2/picture2/" data-orig-file="https://i0.wp.com/mailplus815157217.wpcomstaging.com/wp-content/uploads/2021/02/Picture2.png?fit=126%2C45&ssl=1" data-orig-size="126,45" data-comments-opened="1" data-image-meta="{"aperture":"0","credit":"","camera":"","caption":"","created_timestamp":"0","copyright":"","focal_length":"0","iso":"0","shutter_speed":"0","title":"","orientation":"0"}" data-image-title="Picture2" data-image-description="" data-medium-file="https://i0.wp.com/mailplus815157217.wpcomstaging.com/wp-content/uploads/2021/02/Picture2.png?fit=126%2C45&ssl=1" data-large-file="https://i0.wp.com/mailplus815157217.wpcomstaging.com/wp-content/uploads/2021/02/Picture2.png?fit=126%2C45&ssl=1"> </div> <div id="text-3" class="widget widget_text sidebar__element" style="font-size: 16px !important; line-height: 27px !important;"> <div class="textwidget"> <h4 style="margin-bottom: 0px !important;">Helping small to medium sized </br>Aussie businesses grow.</h4> </div> </div>  </div> <div class="col-sm-6 col-md-2 col-xs-12"> <div id="text-4" class="widget widget_text sidebar__element"> <div class="textwidget"> <h5 style="margin-bottom: 0px !important;font-size: 14px !important;">Why MailPlus</h5> <p><a href="https://mailplus.com.au/mailplus-express-delivery/" class="footer_links">MailPlus Express</a><br> <a href="https://mailplus.com.au/post-office-solutions/" class="footer_links">Post Office solutions</a><br> <a href="https://mailplus.com.au/about-mailplus/" class="footer_links">About MailPlus</a><br><a href="https://mailplus.com.au/faqs/" class="footer_links">FAQs</a></p> </div> </div> <div id="text-10" class="widget widget_text sidebar__element" style="margin-top: 14px;margin-bottom: 14px !important;"> <div class="textwidget"> <h5 style="margin-bottom: 0px !important;font-size: 14px !important;">Customer links</h5> <p><a href="https://www.bpoint.com.au/pay/mailplus" class="footer_links" style="">Pay my invoice</a></br><a href="https://mailplus.com.au/customer-enquiry-form/" class="footer_links" style="">Delivery support form</a></br><a href="https://mailplus.com.au/portal-support-ticket/" class="footer_links" style="">Portal support ticket</a></br><a href="https://mailplus.com.au/ticket-status/" class="footer_links" target="_blank">Ticket status </a></br><a href="https://my.freightsafe.com/aus/claimform/mpa" class="footer_links">FreightSafe warranty </a></br><a href="https://mailplus.com.au/commonly-asked-portal-questions/" class="footer_links">Commonly asked portal questions </a> </div> </div></div> <div class="col-sm-6 col-md-2 col-xs-12"> <div id="text-5" class="widget widget_text sidebar__element"> <div class="textwidget"> <h5 style="margin-bottom: 0px !important;font-size: 14px !important;">For small business</h5> <a href="https://mailplus.com.au/shipping-101/" class="footer_links"><p style="margin-bottom: 14px !important;">Shipping 101<br></a> <a href="https://mailplus.com.au/why-fast-delivery-matters-most/" class="footer_links"> Why express matters<br></a> <a href="https://mailplus.com.au/for-small-business/" class="footer_links"> All Articles </a></p> </div> </div> <div id="text-10" class="widget widget_text sidebar__element" style="margin-bottom: 14px !important;"> <div class="textwidget"> <h5 style="margin-bottom: 0px !important;font-size: 14px !important;">Franchise for sale</h5> <a href="https://mailplus.com.au/become-a-franchisee/" class="footer_links"><p style="margin-bottom: 14px !important;">Become a franchisee</a></br> <a href="https://mailplus.com.au/refer-a-friend-cash-incentive/" class="footer_links">Refer a friend</a></br> </p></div> </div> </div> <div class="col-sm-6 col-md-3 col-xs-12"> <div id="custom_html-8" class="widget_text widget widget_custom_html sidebar__element"> <div class="textwidget custom-html-widget"> <h5 class="font-weight-bold  " style="margin-bottom: 0px !important;font-size: 14px !important;"> <b>Contact</b> </h5> <!-- List --> <ul class="list-unstyled list-unstyled mb-6 mb-md-8 mb-lg-0" style="margin-left: 0px !important; padding-left: 0px !important;margin-bottom: 1em;"> <li class=" font-weight-bold" style="list-style: none !important; font-weight: bold;"> <i class="fas fa-phone-alt"></i> 1300 65 65 95 </li> <li class=" font-weight-bold" style="list-style: none !important;"> Monday - Friday </li> <li class=" font-weight-bold" style="list-style: none !important;"> 9am - 5pm AEST. </li> </ul> </div> </div>  </div> <div class="clear"></div> </div> <!--end of row--> </div> <!--end of container--> <div class="footer__lower text-center-xs"> <div class="container" style="width: 95% !important;"> <div class="row"> <div class="col-sm-6"> <div class="footer-stack-copyright"><span class="" style="color: #103D39 !important"><a href="" style="color: #ffffff !important;text-decoration: none;font-family: "objectsans-regular" !important;">2024 MailPlus Pty. Ltd. All rights reserved.</a></span></div> </div> <div class="col-sm-6 text-right text-center-xs"><span class="" style="color: #ffffff !important;"><a href="https://mailplus.com.au/privacy-policy/" style="color: #ffffff !important;text-decoration: none;font-family: "objectsans-regular" !important;">Privacy Policy.</a><a href="https://mailplus.com.au/terms-conditions/" style="color: #ffffff !important;padding-left:1em;text-decoration: none;font-family: "objectsans-regular" !important;">Terms & Conditions.</a></span></div> </div> </div> </div></footer>';

			//Hidden Fields
			form
				.addField({
					id: "custpage_customer_internal_id",
					type: ui.FieldType.TEXT,
					label: "Day",
				})
				.updateDisplayType({
					displayType: ui.FieldDisplayType.HIDDEN,
				}).defaultValue = customerInternalId;

			form
				.addField({
					id: "preview_table",
					label: "inlinehtml",
					type: "inlinehtml",
				})
				.updateLayoutType({
					layoutType: ui.FieldLayoutType.STARTROW,
				}).defaultValue = inlineHtml;

			form.addSubmitButton({ label: "" });

			form.clientScriptFileId = 7357007;

			context.response.writePage(form);
		} else {
			var customerInternalId =
				context.request.parameters.custpage_customer_internal_id;

			var customerRecord = record.load({
				type: record.Type.CUSTOMER,
				id: customerInternalId,
			});
			var entityId = customerRecord.getValue({
				fieldId: "entityid",
			});
			var compnayName = customerRecord.getValue({
				fieldId: "companyname",
			});
			var tncaccepted = customerRecord.getValue({
				fieldId: "custentity_terms_conditions_agree",
			});

			log.debug({
				title: "customerInternalId",
				details: customerInternalId,
			});

			//UPDATE THE COMMENCEMENT REGISTER RECORD
			var commRegUpdateTnCAgreedDateSearch = search.load({
				id: "customsearch_comm_reg_upd_tnc_date",
				type: "customrecord_commencement_register",
			});

			commRegUpdateTnCAgreedDateSearch.filters.push(
				search.createFilter({
					name: "internalid",
					join: "custrecord_customer",
					operator: search.Operator.ANYOF,
					values: parseInt(customerInternalId),
				})
			);

			commRegUpdateTnCAgreedDateSearch
				.run()
				.each(function (commRegUpdateTnCAgreedDateSearchResult) {
					var commRegInternalId =
						commRegUpdateTnCAgreedDateSearchResult.getValue({
							name: "internalId",
						});
					var trialExpiryDate = commRegUpdateTnCAgreedDateSearchResult.getValue(
						{
							name: "custrecord_trial_expiry",
						}
					);
					var commDate = commRegUpdateTnCAgreedDateSearchResult.getValue({
						name: "custrecord_comm_date",
					});

					var date_netsuite = format.format({
						value: new Date(),
						type: format.Type.DATETIME,
					});

					var commRegRecord = record.load({
						type: "customrecord_commencement_register",
						id: commRegInternalId,
					});
					commRegRecord.setValue({
						fieldId: "custrecord_tnc_agreement_date",
						value: getDateToday(),
					});
					commRegRecord.setValue({
						fieldId: "custrecord_trial_status",
						value: 9,
					});
					commRegRecord.save();

					return true;
				});

			log.debug({
				title: "COMMENCEMENT REGISTER RECORD HAS BEEN UPDATED",
				details: "",
			});
			//UPDATE THE CUSTOMER RECORD
			if (tncaccepted != 1 || tncaccepted != "1") {
				customerRecord.setValue({
					fieldId: "custentity_terms_conditions_agree_date",
					value: getDateToday(),
				});
				customerRecord.setValue({
					fieldId: "custentity_cust_closed_won",
					value: true,
				});
				customerRecord.setValue({
					fieldId: "custentity_date_prospect_opportunity",
					value: getDateToday(),
				});
				customerRecord.setValue({
					fieldId: "custentity_terms_conditions_agree",
					value: 1,
				});
				customerRecord.save();
			}

			log.debug({
				title: "CUSTOMER RECORD RECORD HAS BEEN UPDATED",
				details: "",
			});

			//SEND OUT EMAIL TO SALES REP
			var salesRecordSearch = search.load({
				id: "customsearch_sales_record_auto_signed__2",
				type: "customrecord_sales",
			});

			salesRecordSearch.filters.push(
				search.createFilter({
					name: "internalid",
					join: "custrecord_sales_customer",
					operator: search.Operator.ANYOF,
					values: parseInt(customerInternalId),
				})
			);

			var salesRecordLength =
				salesRecordSearch.run().getRange({
					start: 0,
					end: 1,
				});

			if (salesRecordLength != 0) {
				// for (var i = 0; i < salesRecordLength.length; i++) {
				var salesRepEmail = salesRecordLength[0].getValue({
					name: "email",
					join: "CUSTRECORD_SALES_ASSIGNED",
				});

				var email_body =
					"Customer has agreed to the Terms & Conditions. </br></br>";
				email_body += "<u><b>Customer Details</b></u> </br>";
				email_body +=
					"Customer Name: " + entityId + " " + compnayName + "</br>";

				var email_subject =
					"Terms & Conditions Agreed - " + entityId + " " + compnayName;

				email.send({
					author: 112209,
					body: email_body,
					recipients: salesRepEmail,
					subject: email_subject,
					cc: [
						"luke.forbes@mailplus.com.au",
						"fiona.harrison@mailplus.com.au",
						"popie.popie@mailplus.com.au", 'beatriz.lima@mailplus.com.au'
					],
					relatedRecords: { entityId: customerInternalId },
				});

				log.debug({
					title: "EMAIL SENT OUT TO SALES REP",
					details: "",
				});

				// }
			}

			// salesRecordSearch.run().each(function (salesRecordSearchResult) {
			// 	var salesRepEmail = salesRecordSearchResult.getValue({
			// 		name: "email",
			// 		join: "CUSTRECORD_SALES_ASSIGNED",
			// 	});

			// 	var email_body =
			// 		"Customer has agreed to the Terms & Conditions. </br></br>";
			// 	email_body += "<u><b>Customer Details</b></u> </br>";
			// 	email_body +=
			// 		"Customer Name: " + entityId + " " + compnayName + "</br>";

			// 	var email_subject =
			// 		"Terms & Conditions Agreed - " + entityId + " " + compnayName;

			// 	email.send({
			// 		author: 112209,
			// 		body: email_body,
			// 		recipients: salesRepEmail,
			// 		subject: email_subject,
			// 		cc: [
			// 			"luke.forbes@mailplus.com.au",
			// 			"fiona.harrison@mailplus.com.au",
			// 			"popie.popie@mailplus.com.au", 'beatriz.lima@mailplus.com.au'
			// 		],
			// 		relatedRecords: { entityId: customerInternalId },
			// 	});

			// 	log.debug({
			// 		title: "EMAIL SENT OUT TO SALES REP",
			// 		details: "",
			// 	});

			// 	return true;
			// });

			redirect.redirect({
				url: "https://1048144.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1963&deploy=1&compid=1048144&ns-at=AAEJ7tMQyzFm1rLjam_UwBnc0EmfHYGGF-79GJswLG6FmJRp650",
			});
		}
	}

	function getDateToday() {
		var date = new Date();
		format.format({
			value: date,
			type: format.Type.DATE,
			timezone: format.Timezone.AUSTRALIA_SYDNEY,
		});

		return date;
	}

	/*
	 * PURPOSE : ADDS SPACING
	 *  PARAMS :
	 * RETURNS : INLINEHTML
	 *   NOTES :
	 */
	function spacing() {
		var inlineHtml = '<div class="form-group spacing_section">';
		inlineHtml += '<div class="row">';
		inlineHtml += "</div>";
		inlineHtml += "</div>";

		return inlineHtml;
	}

	/*
	 * PURPOSE : ADDS HORIZONTAL LINE TO DIVIDE SECTIONS
	 *  PARAMS :
	 * RETURNS : INLINEHTML
	 *   NOTES :
	 */
	function line() {
		var inlineHtml =
			'<hr style="height:5px; width:100%; border-width:0; color:red; background-color:#fff">';

		return inlineHtml;
	}
	function isNullorEmpty(strVal) {
		return (
			strVal == null ||
			strVal == "" ||
			strVal == "null" ||
			strVal == undefined ||
			strVal == "undefined" ||
			strVal == "- None -" ||
			strVal == "0"
		);
	}

	/**
	 * The header showing that the results are loading.
	 * @returns {String} `inlineHtml`
	 */
	function loadingSection() {
		var inlineHtml =
			'<div class="wrapper loading_section" style="height: 10em !important;left: 50px !important">';
		inlineHtml += '<div class="row">';
		inlineHtml += '<div class="col-xs-12 ">';
		inlineHtml += '<h1 style="color: #095C7B;">Loading</h1>';
		inlineHtml += "</div></div></div></br></br>";
		inlineHtml += '<div class="wrapper loading_section">';
		inlineHtml += '<div class="blue ball"></div>';
		inlineHtml += '<div class="red ball"></div>';
		inlineHtml += '<div class="yellow ball"></div>';
		inlineHtml += '<div class="green ball"></div>';

		inlineHtml += "</div>";

		return inlineHtml;
	}

	function getDateStoreNS() {
		var date = new Date();
		if (date.getHours() > 6) {
			date.setDate(date.getDate() + 1);
		}

		format.format({
			value: date,
			type: format.Type.DATE,
			timezone: format.Timezone.AUSTRALIA_SYDNEY,
		});

		return date;
	}

	return {
		onRequest: onRequest,
	};
});
