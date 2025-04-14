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
			$("#submitter").trigger("click");
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
