$(document).ready(function() {
    // this allows google autocomplete to display

    $(".typeahead").typeahead({
        minLength: 2,
        highlight: true,
    },
    {
        source: getAutocompleteSuggestions,
        displayKey: 'description',
    });

    // this creates event listener for location form
    $("#location_form").submit(function(evt) {
        console.log('submitted form');
        evt.preventDefault();
        var addresses = getAdressesFromForm();
        // points is an array of values from our from inputs
        // makes coordinates from addresses
        makeCoordinates(addresses[0], function(latLonPointOne) {
            makeCoordinates(addresses[1], function(latLonPointTwo) {
                // Now you can process your result with latLonOrigin and latLonDestination
                var coordinates = [latLonPointOne, latLonPointTwo];
                // console.log(coordinates);
                var pointOne_coordinates = coordinates[0];
                var pointTwo_coordinates = coordinates[1];
                // console.log("First point coordinates: " + pointOne_coordinates);
                // console.log("Second point coordinates:" + pointTwo_coordinates);
                var initialMid = findMidPoint(pointOne_coordinates, pointTwo_coordinates);
                // if (coordinates.length >= 2){
                //     findGatheringPoint(pointTwo_coordinates, pointTwo_coordinates, initialMid);}
                calculateDuration(pointOne_coordinates, initialMid);
            });
        });
    });
});

/**
 * Returns an array of addresses gathered from each input of our form.
 *
 * Note : This function must be modified when more location inputs
 * are added.
 *
 */
function getAdressesFromForm() {
    var points = [];
    // console.log("Got here");
    var locationOne = $("#location_one").val();
    // console.log(locationOne);
    var locationTwo = $("#location_two").val();
    // console.log("searchForSpot: ", locationOne, locationTwo);
    points.push(locationOne, locationTwo);
    console.log(points);
    return points;
}

/**
  *  Get Autocomplete suggestions. Uses Google Places AutocompleteService to search 
  *  for known addresses that match the given query
  *
  *  @param {query} the input to suggest autocomplete matches against. e.g: "123 Main St"
  *  @param {cb} a callback to deliver the potential matches. Takes a single array argument of matches
  */
function getAutocompleteSuggestions(query, cb) {
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

/**
  *  Takes an address and makes a coordinate out of it
  *  
  *
  *  @param {target}
  *  @param {callback} a callback to deliver the coordinates takes one address
  */

function makeCoordinates(target, callback) {
    var latlon=[];
    var geocoder = new google.maps.Geocoder();
    // console.log("This is origins:" + origins);
    // ""+turns origins into a string, dunno what it was before
    geocoder.geocode( { 'address': ""+target}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            latlon[0]=results[0].geometry.location.lat();
            latlon[1]=results[0].geometry.location.lng();

            console.log("Lat:" + latlon[0]);
            console.log("Lon:" + latlon[1]);
            // return latlon[0];
            // alert("Is this happening?");
            // debugger;


        } else {
            console.log("Geocode was not successful for the following reason: " + status);
        }

        callback(latlon);
    });
}

/**
  *  Finds midpoint between any two places
  *  
  *
  *  @param {pointOne} this is the first place, must be in coordinate form for math
  *  @param {pointTwo} this is the second place, must be in coordinate form for math
  */

function findMidPoint(pointOne, pointTwo){
    console.log(typeof pointOne);
    var lat_one = pointOne[0];
    // console.log("Lat_one: " + lat_one);
    var lon_one = pointOne[1];
    var lat_two = pointTwo[0];
    var lon_two = pointTwo[1];
    var latitude_mid = ( (lat_one + lat_two) / 2);
    // console.log("Latitude_mid: " + latitude_mid);
    var longitude_mid = ( (lon_one + lon_two) / 2);
    // console.log("Longitude_mid: " + longitude_mid);
    var mid_point = [latitude_mid, longitude_mid];
    console.log("Mid_point: " + mid_point);
    return mid_point;
}

/**
  *  Finds best gathering point between two places, as far as time to reach a midpoint
  *  
  *  @param {pointOne} this is the first place, must be in coordinate form for math
  *  @param {pointTwo} this is the second place, must be in coordinate form for math
  *  @param {initialMid} this is the initial midpoint, will be redefined in this recursive function
  */


// function findGatheringPoint(pointOne, pointTwo, initialMid) {
//     durOne = calculateDuration(pointOne, initialMid);
//     console.log(durOne);

// }

/**
  *  Finds midpoint between any two places
  *  
  *
  *  @param {pointOne} this is the first place, must be in coordinate form for math
  *  @param {pointTwo} this is the second place, must be in coordinate form for math
  */

function calculateDuration(pointOne, pointTwo) {
    console.log("PointOne: " + pointOne);
    console.log("PointTwo: " + pointTwo);
    pointOne = new google.maps.LatLng(pointOne[0], pointOne[1]);
    pointTwo = new google.maps.LatLng(pointTwo[0], pointTwo[1]);
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
        {
            origins: [pointOne],
            destinations: [pointTwo],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false,
            durationInTraffic: true,
        }, calculateDurationCallback);
}

function calculateDurationCallback(response, status) {
    console.log("Hello we're in the calc duration callback!");
    console.log("Response: " + response);
    // need to troubleshooot this, narrow down
    console.log(response.rows.elements.duration.text);
  //   if (status != google.maps.DistanceMatrixStatus.OK) {
  //   alert('Error was: ' + status);
  // } else {
  //   var origins = response.originAddresses;
  //   console.log(origins);
  //   var destinations = response.destinationAddresses;
  //   var outputDiv = document.getElementById('outputDiv');
  //   outputDiv.innerHTML = '';
  //   deleteOverlays();

  //   for (var i = 0; i < origins.length; i++) {
  //     var results = response.rows[i].elements;
  //     addMarker(origins[i], false);
  //     for (var j = 0; j < results.length; j++) {
  //       addMarker(destinations[j], true);
  //       outputDiv.innerHTML += origins[i] + ' to ' + destinations[j]
  //           + ': ' + results[j].distance.text + ' in '
  //           + results[j].duration.text + '<br>';
  //     }
  //   }
  // }
}

