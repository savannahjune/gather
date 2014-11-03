
$(document).ready(function () {

	// NEW TYPE AHEAD STUFF

	$(".typeahead").typeahead({
		minLength: 2,
		highlight: true,
	},
	{
		source: getSuggestions,
		displayKey: 'description',
		highlighter: true,
	});

	$(".btn").submit(searchForSpot);
});

function getSuggestions(query, cb) {
	var service = new google.maps.places.AutocompleteService();
	service.getQueryPredictions({ input: query }, function(predictions, status) {
		if (status != google.maps.places.PlacesServiceStatus.OK) {
			alert(status);
			return;
		}
		console.log(predictions);
		return cb(predictions);

	});
}

function searchForSpot() {
	var locationOne = $("#location_one").val();
	var locationTwo = $("#location_two").val();
	console.log("searchForSpot: ", locationOne, locationTwo);
}