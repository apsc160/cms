/**
 * Looks for tab elements with class "tabcontent" and corresponding links with class "tablink"
 * 
 * Each tabcontent must have a "tab" attribute with unique identifier
 * Each tablink must have a "tab" attribute with equal value
 * 
 * Uses query strings to detect the tab, specfied using "tab=<name>"
 */

// hide tabs
$(".tabcontent").css("display", "none");

// register on-click events
$(".tablinks").click(function() {
	var tab = $(this).attr("tab");
	openTab(tab, true);
});

var queryParams = {};

// get query parameters
window.location.search.replace(
    new RegExp("([^?=&]+)(=([^&]*))?", "g"),
    function($0, $1, $2, $3) { queryParams[decodeURIComponent($1)] = decodeURIComponent($3); }
);

// check for tab and open
if (queryParams["tab"]) {
	openTab(queryParams["tab"], false);
} else {
	// open first tab
	var tabcontent = $(".tabcontent");
	if (tabcontent.length > 0) {
		openTab(tabcontent.first().attr("tab"), false);
	}
}

// load tab state
$(document).ready(function($) {
	if (window.history && window.history.pushState) {
		$(window).on('popstate', function(event) {
			var state = event.originalEvent.state;
			if (state) {
				var tab = state["tab"];
				if (tab) {
					queryParams["tab"] = tab;
					openTab(tab, false);
				}
			}
	  	});
	}
});

// open a specified tab, pushing or replacing state if desired
function openTab(tabName, push) {
	// Declare all variables
	var i, tabcontent, tablinks;
  
	// Get all elements with class="tabcontent" and hide them
	tabcontent = $(".tabcontent");
	tabcontent.css("display", "none");
  
	// Get all elements with class="tablinks" and remove the class "active"
	tablinks = $(".tablinks");
	tablinks.removeClass("active");
  
	// Show the current tab, and add an "active" class to the button that opened the tab
	var tab = $(".tabcontent[tab='" + tabName + "']");
	tab.css("display", "block");

	// add active back to selected tab
	var tablink = $('#' + tabName + '_link')
	tablink.addClass("active");

	// Change window location to add URL params
	if (window.history && history.pushState) {
		// NOTE: doesn't take into account existing params
		queryParams["tab"] = tabName;
		var queryString = "?" + $.param(queryParams);
		if (push) {
			history.pushState(queryParams, "", queryString);
		} else {
			history.replaceState(queryParams, "", queryString);
		}
	}
}


