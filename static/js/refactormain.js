// THESE BE THE PLANS

//1. Take addresses


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

//2. Geocode them

    makeCoordinates(locationOne, function(latLonOrigin) {
        makeCoordinates(locationTwo, function(latLonDestination) {
            // Now you can process your result with latLonOrigin and latLonDestination
            var coordinates = [latLonOrigin, latLonDestination];

            console.log(coordinates);
            var locationOne_coordinates = coordinates[0];
            var locationTwo_coordinates = coordinates[1];
            console.log("locati  onOne coordinates: " + locationOne_coordinates);
            console.log("locationTwo coordinates:" + locationTwo_coordinates);
        )};
    )};


//3. 

// FUNCTIONS AT THE BOTTOM

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

//  geocoding function

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
                            