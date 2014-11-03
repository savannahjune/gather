
$(document).ready(function () {

	// NEW TYPE AHEAD STUFF

	$(".typeahead").typeahead({
		minLength: 2,
		highlight: true,
	},
	{
		source: getSuggestions,
		displayKey: 'description'
	});
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