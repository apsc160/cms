var queryString = {};

window.location.href.replace(
    new RegExp("([^?=&]+)(=([^&]*))?", "g"),
    function($0, $1, $2, $3) { queryString[$1] = $3; }
);

if (queryString["tab"]) {
	openTab(queryString["tab"], false);
} else {
	// open first tab
	var tabcontent = $(".tabcontent");
	if (tabcontent.length > 0) {
		openTab(tabcontent[0].id, false);
	}
}


$(document).ready(function($) {
	if (window.history && window.history.pushState) {
		$(window).on('popstate', function(event) {
			state = event.originalEvent.state;
			if (state && state["tab"]) {
				openTab(state["tab"], false);
			}
	  	});
	}
});

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
	var tab = $('#' + tabName)
	tab.css("display", "block");

	// add active back to selected tab
	var tablink = $('#' + tabName + '_link')
	tablink.addClass("active");

	// Change window location to add URL params
	if (window.history && history.pushState) {
		// NOTE: doesn't take into account existing params
		queryString["tab"] = tabName;
		if (push) {
			history.pushState(queryString, "", "?" + "tab" + "=" + tabName);
		} else {
			history.replaceState(queryString, "", "?" + "tab" + "=" + tabName);
		}
	}
}