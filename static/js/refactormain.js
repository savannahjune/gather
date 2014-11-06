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

        // takes the origins and makes them into coordinates so they 
        // can be passed to the midpoint calculation function 

        makeCoordinates(origins, function(latLonOrigin) {
            makeCoordinates(destinations, function(latLonDestination) {
                // Now you can process your result with latLonOrigin and latLonDestination
                var coordinates = [latLonOrigin, latLonDestination];

                console.log(coordinates);
                var origins_coordinates = coordinates[0];
                var destinations_coordinates = coordinates[1];
                console.log("Origins coordinates: " + origins_coordinates);
                console.log("Destinations coordinates:" + destinations_coordinates);
                // finds midpoint between the origins
                var midpoint = findMidPoint(origins_coordinates, destinations_coordinates);
                console.log("Midpoint: " + midpoint);
                var map = displayMap(origins, destinations, midpoint);
                
                var distance_one = calculateDistance(origins_coordinates, midpoint);
                var distance_two = calculateDistance(destinations_coordinates, midpoint);
                
            }); // end makeCoordinates origins
        }); // end makeCoorinates destinations
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


function calculateDistance(pointA, pointB) {
    // var distance = 0;
    var origin = pointA;
    var destination = pointB;
    var service = new google.maps.DistanceMatrixService();
    // var duration = 0;
    service.getDistanceMatrix(
        {
            origins: [pointA],
            destinations: [pointB],
            // modify this line to change travel mode
            travelMode: google.maps.TravelMode.DRIVING,
            // calculation travel time based on traffic
            durationInTraffic: true,
        }, callback);
            function callback(response, status) {
                console.log("Got here first");
                if(status == google.maps.DistanceMatrixStatus.OK) {
                    var origins = response.originAddresses;
                    var destinations = response.destinationAddresses;

                    for (var i = 0; i < origins.length; i++) {
                        var results = response.rows[i].elements;
                        for (var j = 0; j < results.length; j++) {
                            var element = results[j];
                            var distance = element.distance.value;
                            var duration = element.duration.text;
                            var from = origins[i];
                            var to = destinations[j];
                            // console.log("Distance: " + distance);
                        }
                        console.log("Got here second");
                        // this console logs all info sent back from distance matrix api    
            console.log("Response:");
            console.log(response);
            }
        }
    }
    console.log("Duration: " + duration);
    return duration;
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


