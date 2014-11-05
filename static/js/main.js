// Javascript for Gather
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

// function for autocomplete from google autocomplete api

function getSuggestions(query, cb) {
	var service = new google.maps.places.AutocompleteService();
	service.getQueryPredictions({ input: query }, function(predictions, status) {
		if (status != google.maps.places.PlacesServiceStatus.OK) {
			console.log("Autocomplete status: " + status);
			return;
		}
		// console logs each prediction as you type
		// console.log("Prediction: " + predictions);
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
	
// using distance matrix service to find time, distance between two origins
// console logging distance to use that find midpoint and calculate times
// origins and destiations taken from form

	origins = locationOne;
	destinations = locationTwo;
	var service = new google.maps.DistanceMatrixService();
	service.getDistanceMatrix({
		origins: [locationOne],
		destinations: [locationTwo],
		// modify this line to change travel mode
		travelMode: google.maps.TravelMode.DRIVING,
		// calculation travel time based on traffic
		durationInTraffic: true,
	}, callback);
	function callback(response, status) {
		if(status == google.maps.DistanceMatrixStatus.OK) {
			var origins = response.originAddresses;
			var destinations = response.destinationAddresses;
			var distance = calculateDistance(response);
			// var midPoint = findMidPoint(distance, origins, destinations);
			displayMap(origins, destinations);
		}
	}
}

function calculateDistance(response) {
	var origins = response.originAddresses;
	var destinations = response.destinationAddresses;
	// var distance = 0;
	
	for (var i = 0; i < origins.length; i++) {
		var results = response.rows[i].elements;
		for (var j = 0; j < results.length; j++) {
			var element = results[j];
			var distance = element.distance.value;
			var duration = element.duration.text;
			var from = origins[i];
			var to = destinations[j];
			// console.log("Distance: " + distance);
		// return distance;
		}
		// this console logs all info sent back from distance matrix api	
		console.log("Response:");
		console.log(response);
		getLatLon(origins, destinations);
		displayMap(origins, destinations);
		// findMidPoint(distance, origins, destinations);
	}
	// return distance;
}

function getLatLon(origins, destinations) {
	var geocoder = new google.maps.Geocoder();
	// console.log("This is origins:" + origins);
	// ""+turns origins into a string, dunno what it was before
	function makeCoordinate(target){
		var loc1=[];
		geocoder.geocode( { 'address': ""+origins}, function(results, status) {
	if (status == google.maps.GeocoderStatus.OK) {
			loc1[0]=results[0].geometry.location.lat();
			loc1[1]=results[0].geometry.location.lng();

	console.log(loc1);

  } else {
		console.log("Geocode was not successful for the following reason: " + status);
		}

	});
	return loc1;
}
	loc1 = makeCoordinate(origins);
	loc2 = makeCoordinate(destinations);
	findMidPoint(loc1, loc2);
  }

function findMidPoint(loc1, loc2){

	//lat is loc1[0]
	//lon is loc1[1]
	// var Bx = Math.cos(loc2[0]) * Math.cos(dLon);
	// var By = Math.cos(loc2[0]) * Math.sin(dLon);
	// var lat3 = Math.atan2(Math.sin(loc1[0])+Math.sin(loc2[0]),
 //                      Math.sqrt( (Math.cos(loc1[0])+Bx)*(Math.cos(loc1[0])+Bx) + By*By ) );
	// var lon3 = lon1 + Math.atan2(By, Math.cos(loc1[0]) + Bx);
	var latitude_mid = ( (loc1[0] + loc2[0]) / 2 );
	var longitude_mid = ( (loc1[1] + loc2[1]) /2 );
	var midpoint = (latitude_mid, longitude_mid);
	console.log(midpoint);
}

function displayMap(origins, destinations) {
	// takes origin and destinations from the search for spot function and subs 
	// them into the url for the google maps call for directions
	var src = "https://www.google.com/maps/embed/v1/directions?key=AIzaSyD94Hy8ebu6mo6BwokrIHw2MqOGrlnA26M&origin=" + origins + "&destination=" + destinations;
	$("#map_view").attr("src", src);
}
