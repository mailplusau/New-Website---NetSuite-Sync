/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript

 * Author:               Ankith Ravindran
 * Created on:           Tue Jul 30 2024
 * Modified on:          Tue Jul 30 2024 13:03:56
 * SuiteScript Version:   
 * Description:           
 *
 * Copyright (c) 2024 MailPlus Pty. Ltd.
 */

define([
	"SuiteScripts/jQuery Plugins/Moment JS/moment.min",
	"N/email",
	"N/runtime",
	"N/search",
	"N/record",
	"N/http",
	"N/log",
	"N/error",
	"N/url",
	"N/format",
	"N/currentRecord",
], function (
	moment,
	email,
	runtime,
	search,
	record,
	http,
	log,
	error,
	url,
	format,
	currentRecord
) {
	var zee = 0;
	var franchiseeName = 0;
	var userId = 0;
	var role = 0;

	var deleteAddressArray = [];
	var deleteOperatorArray = [];

	var cartList = [];
	var cartCount = 0;

	var days_of_week = [];
	days_of_week[0] = 0;
	days_of_week[1] = "custrecord_service_freq_day_mon";
	days_of_week[2] = "custrecord_service_freq_day_tue";
	days_of_week[3] = "custrecord_service_freq_day_wed";
	days_of_week[4] = "custrecord_service_freq_day_thu";
	days_of_week[5] = "custrecord_service_freq_day_fri";
	days_of_week[6] = 6;

	var baseURL = "https://1048144.app.netsuite.com";
	if (runtime.EnvType == "SANDBOX") {
		baseURL = "https://1048144-sb3.app.netsuite.com";
	}

	role = runtime.getCurrentUser().role;
	var userName = runtime.getCurrentUser().name;
	var userId = runtime.getCurrentUser().id;
	var currRec = currentRecord.get();

	//Fade out the Loading symbol
	function afterLoad() {
		$(".loading_section").addClass("hide");
		$(".main-content").removeClass("hide");
		$(".view_cart_buttons_section").removeClass("hide");
	}

	//On page load
	function pageInit() {
		//Backgorund color of the page
		$("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
		$("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
		$("#body").css("background-color", "#CFE0CE");
		$(".body_2010").css("background-color", "#CFE0CE");

		$("#tbl_submitter").css("display", "none");
		$(".uir-page-title").css("display", "none");
		$(".uir-header-buttons").css("display", "none");

		//Hide the alert section on the page
		$("#alert").hide();
		$(".error_container").hide();

		$(".loading_section").addClass("hide");

		afterLoad();

		//View the cart.
		$(document).on("click", ".acceptTNC", function (e) {
			var customerInternalId = currRec.getValue({
				fieldId: "custpage_customer_internal_id",
			});

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
						value: date_netsuite,
					});
					commRegRecord.setValue({
						fieldId: "custrecord_trial_status",
						value: 9,
					});
					commRegRecord.save();

					return true;
				});

			//UPDATE THE CUSTOMER RECORD
			if (tncaccepted != 1 || tncaccepted != "1") {
				customerRecord.getValue({
					fieldId: "custentity_terms_conditions_agree_date",
					value: getDateToday(),
				});
				customerRecord.getValue({
					fieldId: "custentity_cust_closed_won",
					value: true,
				});
				customerRecord.getValue({
					fieldId: "custentity_date_prospect_opportunity",
					value: getDateToday(),
				});
				customerRecord.getValue({
					fieldId: "custentity_terms_conditions_agree",
					value: 1,
				});
				customerRecord.save();
			}

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

			salesRecordSearch.run().each(function (salesRecordSearchResult) {
				var salesRepEmail = salesRecordSearchResult.getValue({
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
						"popie.popie@mailplus.com.au",
					],
					relatedRecords: { entityId: customerInternalId },
				});

				return true;
			});
		});
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

	function financial(x) {
		if (typeof x == "string") {
			x = parseFloat(x);
		}
		if (isNullorEmpty(x) || isNaN(x)) {
			return "$0.00";
		} else {
			return x.toLocaleString("en-AU", {
				style: "currency",
				currency: "AUD",
			});
		}
	}

	/*
	 * PURPOSE : Save Record
	 *  PARAMS :
	 * RETURNS :
	 *   NOTES :
	 */
	function saveRecord() {
		console.log("inside save record");
		return true;
	}
	function isNullorEmpty(val) {
		if (val == "" || val == null || val == 0 || val == "0" || val == " ") {
			return true;
		} else {
			return false;
		}
	}
	return {
		pageInit: pageInit,
		saveRecord: saveRecord,
	};
});
