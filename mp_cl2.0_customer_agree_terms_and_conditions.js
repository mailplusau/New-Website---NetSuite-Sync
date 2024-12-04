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
		$(document).on("click", ".viewCart", function (e) {
			$("#itemAddedToCart").hide();

			var voucherInternalId = currRec.getValue({
				fieldId: "custpage_voucher_internal_id",
			});
			var voucherName = currRec.getValue({
				fieldId: "custpage_voucher_name",
			});

			if (cartList.length == 0) {
				var cartModalInlineHtml = "CART IS EMPTY";
			} else {
				var cartModalInlineHtml =
					"<style>table#cartTable {color: #103D39 !important; font-size: 12px;text-align: center;border: solid;}.dataTables_wrapper {font-size: 14px;}table#cartTable th{text-align: center;} .bolded{font-weight: bold;}</style>";
				cartModalInlineHtml +=
					'<div class="table_section "><table id="cartTable" class="table table-responsive table-striped customer tablesorter cell-border compact" style="width: 100%;">';
				cartModalInlineHtml +=
					'<thead style="color: white;background-color: #103D39;">';
				cartModalInlineHtml += '<tr class="text-center">';
				cartModalInlineHtml += "<td></td>";
				cartModalInlineHtml += "<td>ITEM</td>";
				cartModalInlineHtml += "<td>QTY</td>";
				cartModalInlineHtml += "<td>RATE(inc. GST)</td>";
				cartModalInlineHtml += "<td>AMOUNT(inc. GST)</td>";
				cartModalInlineHtml += "</tr>";
				cartModalInlineHtml += "</thead>";
				cartModalInlineHtml += '<tbody id="" >';

				var cartTotalAmount = 0.0;

				for (var j = 0; j < cartList.length; j++) {
					cartModalInlineHtml += "<tr>";
					cartModalInlineHtml +=
						'<td><span class="cart-remove-item glyphicon glyphicon-remove" data-id="' +
						cartList[j].id +
						'" style="color:red;"></span></td>';
					cartModalInlineHtml += "<td>" + cartList[j].name + "</td>";
					cartModalInlineHtml +=
						'<td><span class="cart-pqt-minus glyphicon glyphicon-minus" data-id="' +
						cartList[j].id +
						'"></span> ' +
						cartList[j].count +
						' <span class="cart-pqt-plus glyphicon glyphicon-plus" data-id="' +
						cartList[j].id +
						'"></span></td>';
					cartModalInlineHtml +=
						"<td>" + financial(cartList[j].price) + "</td>";
					cartModalInlineHtml +=
						"<td>" + financial(cartList[j].count * cartList[j].price) + "</td>";

					cartModalInlineHtml += "</tr>";

					cartTotalAmount =
						cartTotalAmount + cartList[j].count * cartList[j].price;
				}

				if (!isNullorEmpty(voucherInternalId)) {
					cartModalInlineHtml +=
						'<tr style="border: solid;background-color: #CFE0CE;">';
					cartModalInlineHtml += "<td></td>";
					cartModalInlineHtml += "<td></td>";
					cartModalInlineHtml +=
						'<td><div class="input-group"><span class="input-group-addon" id="entity_id_text" style="font-size: 12px;">VOUCHER CODE</span><input type="text" placeholder="Enter voucher code" id="voucherCode" class="form-control" value=""/></div></td>';
					cartModalInlineHtml +=
						'<td><input type="button" id="applyVoucher" class="form-control btn btn-primary lift" value="APPLY" style="font-size: 12px;border-radius: 30px;background-color:#F0AECB;color: #0f3d39;"/></td>';
					cartModalInlineHtml +=
						'<td style="vertical-align: middle;"><input type="text" id="discountApplied" class="form-control" style="color: #0f3d39;text-align: center;" value="-' +
						financial(0) +
						'" readonly/></td>';

					cartModalInlineHtml += "</tr>";
				}

				cartModalInlineHtml +=
					'<tr style="border: solid;background-color: #CFE0CE;">';
				cartModalInlineHtml += "<td></td>";
				cartModalInlineHtml += "<td></td>";
				cartModalInlineHtml += "<td></td>";
				cartModalInlineHtml += "<td><b>Total:</b></td>";
				cartModalInlineHtml +=
					'<td><input type="text" id="cartTotalAmount" class="form-control" style="color: #0f3d39;text-align: center;" value="' +
					financial(cartTotalAmount) +
					'" readonly/></td>';

				cartModalInlineHtml += "</tr>";

				cartModalInlineHtml += "</tbody></table></div>";
			}

			$("#viewCartModal .modal-body").html(cartModalInlineHtml);
			$("#viewCartModal").show();
		});

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
