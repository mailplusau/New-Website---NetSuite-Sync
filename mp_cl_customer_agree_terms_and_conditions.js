var geojson;
var geojson2;
var map;
var info;

var categories = {},
	category;

var overlaysObj = {},
	categoryName,
	categoryArray,
	categoryLG;

var allPointsLG;

var stateLG = [];

var selected_areas = [];
var deleted_areas = [];

var basemapsObj = {};

var partner_state;
var partner_location;
var same_day;
var next_day;

var baseURL = "https://1048144.app.netsuite.com";
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
	baseURL = "https://system.sandbox.netsuite.com";
}

function pageInit() {
	$("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
	$("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
	$("#body").css("background-color", "#CFE0CE");

	partner_state = nlapiGetFieldValue("partner_state");
	var codes = nlapiGetFieldValue("partner_location");

	same_day = nlapiGetFieldValue("same_day");
	next_day = nlapiGetFieldValue("next_day");
	if (!isNullorEmpty(same_day)) {
		same_day = same_day.split(",");
	}

	if (!isNullorEmpty(next_day)) {
		next_day = next_day.split(",");
	}

	if (!isNullorEmpty(codes)) {
		partner_location = codes.split(",");
	}
	console.log(partner_location);

	map = L.map("map", {
		zoomControl: false,
	}).setView([-27.833, 133.583], 4);

	// var customLayer = L.geoJson(null, {
	// 	// http://leafletjs.com/reference.html#geojson-style
	// 	style: function(feature) {
	// 		return {
	// 			weight: 2,
	// 			color: '#666',
	// 			dashArray: '',
	// 			fillOpacity: 0.7,
	// 			fillColor: '#5cb85c'
	// 		};
	// 	}
	// });

	// omnivore.kml('https://1048144.app.netsuite.com/core/media/media.nl?id=1318421&c=1048144&h=4fc1e382ffe48f5cde34&mv=ibvx69x4&_xt=.txt&whence=', null, customLayer).addTo(map);

	$.getJSON(
		"https://1048144.app.netsuite.com/core/media/media.nl?id=2080754&c=1048144&h=a14f4ecbf9986cff6fb1&_xt=.js",
		function (data) {
			console.log(data);

			// add GeoJSON layer to the map once the file is loaded
			geojson2 = L.geoJson(data, {
				style: style2,
				// filter: layerFilter2,
				onEachFeature: onEachFeature,
			});

			ready(data);
		}
	);
}

function saveRecord() {
	var code_elem = document.getElementsByClassName("state_code");
	var tableOpSelect_elem = document.getElementsByClassName("tableOpSelect");
	// var next_day_elem = document.getElementsByClassName("next_day_rate");
	var code = [];
	var op_array = [];
	var next_day_array = [];

	for (var i = 0; i < code_elem.length; ++i) {
		code[i] = code_elem[i].value;
		op_array[i] = tableOpSelect_elem[i].value;
		// next_day_array[i] = next_day_elem[i].value;
	}

	var total_array = code.toString();

	var strs = [];
	var text_field_length = 300;

	// while (total_array.length >= text_field_length) {
	// 	var pos = (total_array.substring(0, text_field_length).lastIndexOf(','));
	// 	pos = pos <= text_field_length ? (text_field_length + 1) : pos;
	// 	strs.push(total_array.substring(0, pos));
	// 	var i = total_array.indexOf(',', pos) + 1;
	// 	if (i < pos || i > pos + text_field_length) {
	// 		i = pos;
	// 	}
	// 	total_array = total_array.substring(i);
	// }
	// strs.push(total_array);

	// console.log(strs);

	console.log(total_array);
	console.log(op_array);
	console.log(next_day_array);

	nlapiSetFieldValue("code_array", total_array);
	nlapiSetFieldValue("same_day_array", op_array.toString());
	nlapiSetFieldValue("next_day_array", next_day_array.toString());
	// if (!isNullorEmpty(strs[1])) {
	// 	nlapiSetFieldValue('code_array2', strs[1]);
	// }
	// if (!isNullorEmpty(strs[2])) {
	// 	nlapiSetFieldValue('code_array3', strs[2]);
	// }

	return true;
}
