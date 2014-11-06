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
    function searchForSpot(evt) {
        evt.preventDefault();
        // console.log("Got here");
        var locationOne = $("#location_one").val();
        // console.log(locationOne);
        var locationTwo = $("#location_two").val();
        // console.log("searchForSpot: ", locationOne, locationTwo);

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
            //this is all for calculateDistance function
            if(status == google.maps.DistanceMatrixStatus.OK) {
                var origins = response.originAddresses;
                var destinations = response.destinationAddresses;
                // using distance matrix service to find time, distance between two origins
                // console logging distance to use that find midpoint and calculate times
                // origins and destiations taken from form
                // var distance = calculateDistance(response);

                makeCoordinates(origins, function(latLonOrigin) {
                    makeCoordinates(destinations, function(latLonDestination) {
                        // Now you can process your result with latLonOrigin and latLonDestination
                        var coordinates = [latLonOrigin, latLonDestination];

                        console.log(coordinates);
                        var origins_coordinates = coordinates[0];
                        var destinations_coordinates = coordinates[1];
                        console.log("Origins coordinates: " + origins_coordinates);
                        console.log("Destinations coordinates:" + destinations_coordinates);
                        var midpoint = findMidPoint(origins_coordinates, destinations_coordinates);
                        console.log(midpoint);
                        var map = displayMap(origins, destinations, midpoint);
                    });
                });
            }
        }
    }
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

function findMidPoint(origins_coordinates, destinations_coordinates){
    console.log(typeof origins_coordinates);
    var lat_one = origins_coordinates[0];
    // console.log("Lat_one: " + lat_one);
    var lon_one = origins_coordinates[1];
    var lat_two = destinations_coordinates[0];
    var lon_two = destinations_coordinates[1];
    var latitude_mid = ( (lat_one + lat_two) / 2);
    // console.log("Latitude_mid: " + latitude_mid);
    var longitude_mid = ( (lon_one + lon_two) / 2);
    // console.log("Longitude_mid: " + longitude_mid);
    var mid_point = [latitude_mid, longitude_mid];
    console.log("Mid_point: " + mid_point);
    return mid_point;

    // this is the formual to find the great circle mid point. 
    // useful if the origins are more than 250 miles apart
    // var Bx = Math.cos(φ2) * Math.cos(λ2-λ1);
    // var By = Math.cos(φ2) * Math.sin(λ2-λ1);
    // var φ3 = Math.atan2(Math.sin(φ1) + Math.sin(φ2),
    //                 Math.sqrt( (Math.cos(φ1)+Bx)*(Math.cos(φ1)+Bx) + By*By ) );
    // var λ3 = λ1 + Math.atan2(By, Math.cos(φ1) + Bx);
}

// function to calculate distances and travel times between points


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
    }
    // return distance;
}

// map display function, creates url out of origins and destination to show route

function displayMap(origins, destinations, midpoint) {
    // takes origin and destinations from the search for spot function and subs 
    // them into the url for the google maps call for directions
    var src1 = "https://www.google.com/maps/embed/v1/directions?key=AIzaSyD94Hy8ebu6mo6BwokrIHw2MqOGrlnA26M&origin=" + origins + "&destination=" + midpoint;
    var src2 = "https://www.google.com/maps/embed/v1/directions?key=AIzaSyD94Hy8ebu6mo6BwokrIHw2MqOGrlnA26M&origin=" + destinations + "&destination=" + midpoint;
    $("#map_view1").attr("src", src1);
    $("#map_view2").attr("src", src2);
}


