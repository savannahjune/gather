
$(document).ready(function() {

	// this allows google autocomplete to display

	$(".typeahead").typeahead({
		minLength: 2,
		highlight: true,
	},
	{
		source: getSuggestions,
		displayKey: 'description',
	});

	// this creates event listener for location form

	$("#location_form").submit(searchForSpot);
});

// function for autocomplete from google autocomplete

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

// function to submit and store variables for locations

function searchForSpot(evt) {
	evt.preventDefault();
	// console.log("Got here");
	var locationOne = $("#location_one").val();
	// console.log(locationOne);
	var locationTwo = $("#location_two").val();
	// console.log("searchForSpot: ", locationOne, locationTwo);
	
// using distance matrix service to find time between two origins
	origins = locationOne;
	destinations = locationTwo;
	var service = new google.maps.DistanceMatrixService();
	service.getDistanceMatrix({
		origins: [locationOne],
		destinations: [locationTwo],
		travelMode: google.maps.TravelMode.DRIVING,
		durationInTraffic: true,
	}, callback);
	function callback(response, status) {
		if(status == google.maps.DistanceMatrixStatus.OK) {
			var origins = response.originAddresses;
			var destinations = response.destinationAddresses;
			
			for (var i = 0; i < origins.length; i++) {
				var results = response.rows[i].elements;
				for (var j = 0; j < results.length; j++) {
					var element = results[j];
					var distance = element.distance.text;
					var duration = element.duration.text;
					var from = origins[i];
					var to = destinations[j];
					console.log(distance);
				}
			console.log(response);
			}
		}
	}
}

// "https://maps.googleapis.com/maps/api/distancematrix/json?origins=" + origins + "&destinations=" + destinations + "mode=bicycling" + "&key=API_KEY"