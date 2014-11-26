/** Global starting points. Accessed throughout recursive calls to findGatheringPoint **/
var initialPointOne;
var initialPointTwo;

/** findGatheringPoint recursion counter. Places a upper limit on the number of iterations of our binary search.  Higher number
of allowed attempts makes the gathering point more accurate, but takes more time **/
const maxAttempts = 14;
var numAttempts;

$(document).ready(function() {
    /** this function provides google 
    autocomplete of addresses */

    $(".typeahead").typeahead({
        minLength: 2,
        highlight: true,
    },
    {
        source: getAutocompleteSuggestions,
        displayKey: 'description',
    });

    // this creates event listener for location form
    $("#location_input").on('click', function(evt) {
        numAttempts = 0;
        // console.log('submitted form');
        evt.preventDefault();
        var methodTransportOne = $("input:radio[name=transport_radio1]:checked").val();
        // console.log("Method transport one: " + methodTransportOne);
        var methodTransportTwo = $("input:radio[name=transport_radio2]:checked").val();
        // console.log("Method transport two: " + methodTransportTwo);
        var addresses = getAddressesFromForm();
        // points is an array of values from our from inputs
        // makes coordinates from addresses
        makeCoordinates(addresses[0])
        .then(function(latLonPointOne) {
            /**
            * this function converts coordinates to addresses
            *
            * @param {latLonPointOne} <integer> coordinate
            * @return {addresses} <array> addresses, strings
            *
            */
            initialPointOne = latLonPointOne;
            return makeCoordinates(addresses[1])
            .then(function(latLonPointTwo) {
                /**
                * this function converts coordinates to addresses
                *
                * @param {latLonPointTwo} <integer> coordinate
                * @return {addresses} <array> addresses, strings
                *
                */
                initialPointTwo = latLonPointTwo;
                return [latLonPointOne, latLonPointTwo];
            });
        })
        .then(function(latlons) {
            /**
            * this function takes latlons and finds 
            * initial simple geographical midpoint between them
            * 
            * @param {latlons} <array> latitudes & longitudes
            * @return {initialMid} <integer> coordinate of geo-midpoint
            */
            latLonPointOne = latlons[0];
            latLonPointTwo = latlons[1];
            // console.log("Got both latLons " + latLonPointOne + " " + latLonPointTwo);
            var initialMid = findMidPoint(latLonPointOne, latLonPointTwo);
            if (latLonPointOne, latLonPointTwo) {
                // console.log("Started find gathering point", initialMid);
                return findGatheringPoint(initialPointOne, initialPointTwo, initialMid, methodTransportOne, methodTransportTwo);
            } else {
                console.log("Error with latlons");
            }

        })
        .then(function(gatheringPoint) {
            /**
            * this is the returned function from gathering point
            *
            * @param {gatheringPoint} <integer> coordinate between two points
            * @return {businessPlaceID} <string> returns Google Maps Place ID
            *
            */
            console.log("Gathering Point: " + gatheringPoint);
            return findBusiness(gatheringPoint);
        })
        .then(function(businessPlaceID){
            /**
            * takes returned businessPlaceID to use in displayPlaceInfo function 
            *
            * @param {businessPlaceID} <string> returned Google Maps Place ID
            * @return {businessPlaceID} <string> to be used in displayPlaceInfo function 
            *
            */
            return displayPlaceInfo(businessPlaceID);
        })
        .then(function(placeAddress){
            /**
            * takes placeAddress from displayPlaceInfo in order to pass it to
            * displayMap
            *
            * @param {placeAddress} <string> address of a business
            * @return {placeAddress, methodTransportOne, methodTransportTwo} <string>
            */
            return displayMap(placeAddress, methodTransportOne, methodTransportTwo);
        })
        .catch(function (error) {
            /**
            * catches errors in the main promises chain and console logs them
            *
            * @param {error} <string> description of error in the main promises chain
            */
        console.log("Main Chain Error: " + error);
        });
    });
});

/**
 * @return <array> an array of addresses(strings) gathered from each input of our form.
 *
 * Note : This function must be modified when more location inputs
 * are added.
 *
 */
function getAddressesFromForm() {
    var points = [];
    // console.log("Got here");
    var locationOne = $("#location_one").val();
    // console.log(locationOne);
    var locationTwo = $("#location_two").val();
    // console.log("searchForSpot: ", locationOne, locationTwo);
    points.push(locationOne, locationTwo);
    // console.log(points);
    return points;
}

/**
  *  Get Autocomplete suggestions. Uses Google Places AutocompleteService to search 
  *  for known addresses that match the given query
  *
  *  @param {query} <string> the input to suggest autocomplete matches against. e.g: "123 Main St"
  *  @param {cb} a callback to deliver the potential matches. Takes a single array argument of matches
  *  @return {null|predictions} null or prediction from Google Maps Autocomplete
  */
function getAutocompleteSuggestions(query, callback) {
    var service = new google.maps.places.AutocompleteService();
    service.getQueryPredictions({ input: query }, function(predictions, status) {
        if (status != google.maps.places.PlacesServiceStatus.OK) {
            // console.log("Autocomplete status: " + status);
            return;
        }
        // console logs each prediction as you type
        // console.log("Prediction: " + predictions);
        return callback(predictions);

    });
}

/**
  *  Takes an address and makes a coordinate out of it
  *  
  *
  *  @param {target} <string> address to become a coordinate
  *  @return {latlon} <array> array of coordinates(integers)
  */
function makeCoordinates(target) {
    var deferred = Q.defer();

    var latlon=[];
    var geocoder = new google.maps.Geocoder();

    geocoder.geocode( { 'address': ""+target}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            latlon[0]=results[0].geometry.location.lat();
            latlon[1]=results[0].geometry.location.lng();

            // console.log("Lat:" + latlon[0]);
            // console.log("Lon:" + latlon[1]);

            deferred.resolve(latlon);

        } else {
            console.log("Geocode was not successful for the following reason: " + status);
            deferred.reject(new Error(status));
        }
    });

    return deferred.promise;
}

/**
  *  Finds midpoint between any two places.
  *  Uses simple math to find this midpoint rather than the great circle midpoint.
  *  Reasons for not using great circle midpoint: it is only useful if the two points
  *  are > 250 miles from each other, which is not what this app is intended for.
  *  Also, the midpoint is reset in the gathering point function, due to traveling times
  *  so the midpoint is only an initial starting place.
  *
  *  @param {pointOne} <integer> this is the first place, must be in coordinate form for math
  *  @param {pointTwo} <integer> this is the second place, must be in coordinate form for math
  *  @return {intialMid} <integer> this is the simple, geo midpoint 
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
    var initialMid = [latitude_mid, longitude_mid];
    // console.log("Mid_point: " + mid_point);
    return initialMid;
}

 // this is the formula to find the great circle mid point. 
    // useful if the origins are more than 250 miles apart
    // var Bx = Math.cos(φ2) * Math.cos(λ2-λ1);
    // var By = Math.cos(φ2) * Math.sin(λ2-λ1);
    // var φ3 = Math.atan2(Math.sin(φ1) + Math.sin(φ2),
    //                 Math.sqrt( (Math.cos(φ1)+Bx)*(Math.cos(φ1)+Bx) + By*By ) );
    // var λ3 = λ1 + Math.atan2(By, Math.cos(φ1) + Bx);

/**
  *  Finds best gathering point between two places, as far as time to reach a midpoint
  *  
  *  @param {pointOne} integer, must be in coordinate form for math, first location
  *  @param {pointTwo} integer, must be in coordinate form for math, second location
  *  @param {initialMid} integer, coordinate, initial midpoint that is redefined in this recursive function
  *  @param {methodTransportOne} string, taken from form, method of transport for first user
  *  @param {methodTransportTwo} string, taken from form, method of transport for second user
  *  @return {gatheringPoint} most optimal place for two people to meet, spend equal amounts of time getting there
  */

function findGatheringPoint(pointOne, pointTwo, initialMid, methodTransportOne, methodTransportTwo) {
    numAttempts++;
    var deferred = Q.defer();

    return calculateDuration(initialPointOne, initialMid, methodTransportOne)
    // calculates duration between the first point and initial mid (reset in recursive function)
    .then(function(durationOne) {
        return calculateDuration(initialPointTwo, initialMid, methodTransportTwo)
        // calculates duration between the first point and initial mid (reset in recursive function)
               .then(function(durationTwo) {
                // after both durations have been found, returns them
                    return [durationOne, durationTwo];
               });
    })
    .spread(function(durationOne, durationTwo) {
        // Pulls apart the two durations for comparison
        console.log("Duration one: " + durationOne);
        console.log("Duration two: " + durationTwo);
        console.log("Difference in duration: " + Math.abs(durationOne - durationTwo));
        var tolerance = 0.05 * ((durationOne + durationTwo) / 2);
        if ((Math.abs(durationOne - durationTwo) <= tolerance) || numAttempts >= maxAttempts) {
            if (numAttempts >= maxAttempts) {
                console.log("Stopped findGatheringPoint after max attempts reached");
            }
            // if the coordinate meets all requirements, then use it as gathering point
            deferred.resolve(initialMid);
            console.log("Found the gathering point: " + initialMid);
            return deferred.promise;

        /**
        * the else if and else below constitute the binary search tree
        * that this algorithm uses to find optimal midpoint between two people
        */
        }
        else if (durationOne > durationTwo) {
            /** if duration one is greater, move initialMid to between initialMid and pointOne
              * by passing it into findMidPoint
              **/
            console.log("Duration one was greater!");
            newMidpoint = findMidPoint(pointOne, initialMid);
            console.log("New midpoint between pointOne and initialMid: " + newMidpoint);
            return findGatheringPoint(pointOne, initialMid, newMidpoint, methodTransportOne, methodTransportTwo);
        }
        else {
            /** if duration two is greater, move initialMid to between initialMid and pointTwo
              * by passing it into findMidPoint
              **/
            console.log("Duration two was greater!");
            newMidpoint = findMidPoint(pointTwo, initialMid);
            console.log("New midpoint between pointTwo and initialMid: " + newMidpoint);
            return findGatheringPoint(initialMid, pointTwo, newMidpoint, methodTransportOne, methodTransportTwo);
        }

    })
    .catch(function (error) {
        console.log("findGatheringPoint Error: " + error);
    });

}

/**
  *  Finds duration of time between two places used in findGatheringPoint function
  *
  *  @param {pointOne} <integer> first place, must be in coordinate form for math
  *  @param {pointTwo} <integer> second place, must be in coordinate form for math
  *  @return {duration} <integer> time between two places
  **/
function calculateDuration(pointOne, pointTwo, methodTransport) {
    var deferred = Q.defer();

    // console.log("PointOne: " + pointOne);
    // console.log("PointTwo: " + pointTwo);
    pointOne = new google.maps.LatLng(pointOne[0], pointOne[1]);
    pointTwo = new google.maps.LatLng(pointTwo[0], pointTwo[1]);
    var service = new google.maps.DistanceMatrixService();
    // console.log("About to get Distance Matrix");

    // console.log("Method transport in distance matrix calculation: ");
    // console.log(methodTransport);
    
    service.getDistanceMatrix(
        {
            origins: [pointOne],
            destinations: [pointTwo],
            travelMode: methodTransport,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false,
            durationInTraffic: true,
        }, function(response, status) {
            // TODO : Check status for success. Call deferred.reject(new Error("Some error message"));
            // value in this case is seconds, duration is in seconds
            // console.log(response);
            var duration = (response.rows[0].elements[0].duration.value);
            // console.log("Got google duration " + duration);
            deferred.resolve(duration);
        });

    // console.log("leaving calculateDuration");
    return deferred.promise;
}

/**
  *  Finds business for people to meet at within a certain range of their equal time midpoint
  *  
  *
  *  @param {gatheringPoint} <integer> this is the equal time midpoint from the findGatheringPoint function, coordinate
  *  @return {placeID} <string> unique id for a business from google places api search
  */


function findBusiness(gatheringPoint) {
    /* sets up index for business search incremented when users want to see another business */
    var businessIndex = 0;
    var deferred = Q.defer();

    var spotToSearch = new google.maps.LatLng(gatheringPoint[0], gatheringPoint[1]);
    // console.log("Spot to search: " + spotToSearch);

    // gets type of business users wants from form on the page
    var map = new google.maps.Map(document.getElementById('map-canvas'));

    var type = $("input:radio[name=business_option]:checked").val();

    var request = {
        location: spotToSearch,
        // radius: '50000',
        types: [type],
        openNow: true,
        rankBy: google.maps.places.RankBy.DISTANCE
    };


    var service = new google.maps.places.PlacesService(map);
    /**
    * Finds business options near gatheringPoint, and gets info about the business
    * Users are allowed to request next business in the object when they press button
    *
    * Since this search needs to be done each time the button is pressed, and then
    * the map must update as well, this function is kept here to retain its spot in 
    * the promise chain and not made seperate as that would not allow for both the first time
    * a business is found and each time the button is pressed
    * @param {response} <object> JSON object with up to 20 businesses in the radius
    * @param {status} <string> status of whether the function was successful
    * @return {placeID} <string> this is then passed to displayPlaceInfo
    */
    service.nearbySearch(request, function businessOptions(response, status) {
        if (response[businessIndex]){
            var placeObj = (response[businessIndex]);
            var placeID = (response[businessIndex].place_id);
            // console.log("Place object: ");
            // console.log(placeObj);
            var placeLat = (response[businessIndex].geometry.location.k);
            var placeLon = (response[businessIndex].geometry.location.B);
            var placeComplete = [placeLat, placeLon];

            deferred.resolve(placeID);

            if (response.length > 1 && businessIndex < response.length){
                $(".next_spot").show();
                $("#next_business").unbind("click");
                $("#next_business").click(function(evt) {
                    evt.preventDefault();
                    businessIndex++;
                    // console.log("businessIndex after users asks for another business: ");
                    // console.log(businessIndex);
                    placeID = businessOptions(response, status);
                    displayPlaceInfo(placeID);
                });
            }
            return placeID;
        }
        else {
            $(".next_spot").hide();
            // console.log("businessIndex should now be out of range")
        }
    }); /* end of businessOptions */
    return deferred.promise;
} /* end of findBusiness */

/**
  *  Finds specific info about a business using Google Places Details API
  *  
  *
  *  @param {placeID} placeID from the current business found in the findBusiness function
  *  @return {placeAddress, methodTransportOne, methodTransportTwo} <string> these are used by the display map function
  *  to show directions between each starting point and the place address, according to each method of transport
  */

function displayPlaceInfo(placeID) {
    var placeDetailsArray = [];
    var deferred = Q.defer();
    var map = new google.maps.Map(document.getElementById('map-canvas'));

    var request = {
        placeId: placeID,
    };

    var service = new google.maps.places.PlacesService(map);
    service.getDetails(request, function(response, status) {
        var placeInfo = response;
        console.log(placeInfo);
        $(".business").show();
        // this displays the name and makes it a link to the required Google website for the place
        $("#placeName").html("<a href=\"" + response.url + "\">" + response.name + "</a>");
        var placeAddress = (response.formatted_address);
        $("#placeAddress").html(placeAddress);
        var placeLat = (response.geometry.location.k);
        var placeLon = (response.geometry.location.B);
        var placeLatLon = [placeLat, placeLon];
        if (response.rating){
            $("#googlePlusRating").html("Google+ Rating: " + response.rating + " out of 5");
        }
        if (response.formatted_phone_number){
            $("#placePhoneNumber").html(response.formatted_phone_number);
        }
        var dayOfWeek = new Date().getDay();
        if (response.opening_hours){
            if (dayOfWeek === 0) {
                $("#hoursSunday").html(response.opening_hours.weekday_text[6]);
            }
            if (dayOfWeek === 1) {
                $("#hoursMonday").html(response.opening_hours.weekday_text[0]);
            }
            if (dayOfWeek === 2) {
                $("#hoursTuesday").html(response.opening_hours.weekday_text[1]);
            }
            if (dayOfWeek === 3) {
                $("#hoursWednesday").html(response.opening_hours.weekday_text[2]);
            }
            if (dayOfWeek === 4) {
                $("#hoursThursday").html(response.opening_hours.weekday_text[3]);
            }
            if (dayOfWeek === 5) {
                $("#hoursFriday").html(response.opening_hours.weekday_text[4]);
            }
            if (dayOfWeek === 6) {
                $("#hoursSaturday").html(response.opening_hours.weekday_text[1]);
            }
        }
        
        if (response.website) {
            $("#placeWebsite").html("<a href=\"" + response.website + "\">website</a>");
        }
        if (response.price_level){
            if (response.price_level === 1) {
                $("#placePriceLevel").html("<strong>$</strong> out of $$$$");
            }
            if (response.price_level === 2) {
                $("#placePriceLevel").html("<strong>$$</strong> out of $$$$");
            }
            if (response.price_level === 3) {
                $("#placePriceLevel").html("<strong>$$$<strong> out of $$$$");
            }
            if (response.price_level === 4) {
                $("#placePriceLevel").html("$$$$ out of $$$$");
            }
        }

        // other info from places that I have not yet used, but exists
        // var placeIcon = (response.icon);
        // var placePhotos = (response.photos);
            // photos have photo_reference, height, width
        // var placeReviews = response.views 
            // this is an array of up to five reviews
            // reviews have a type which indicates what aspect of the place is being reviewed response.reviews[index].aspects.type
            // reviews also have reviews[].author_name , author url which links to googleplus profile if available
            // reviews also have text/content, reviews[].text & time of review, reviews[].time
        // var placeTypes = response.types[], tells you what establishment types google attributes to that location

        deferred.resolve(placeAddress);
        var methodTransportOne = $("input:radio[name=transport_radio1]:checked").val();
        var methodTransportTwo = $("input:radio[name=transport_radio2]:checked").val();

        var addresses = getAddressesFromForm();
        var addressOne = addresses[0].split(' ').join('+');
        var addressTwo = addresses[1].split(' ').join('+');
        placeAddress = placeAddress.split(' ').join('+');

        shareLinkBoth = "comgooglemaps://?saddr=&daddr=" + placeAddress;

        // shareLink1 = "comgooglemaps://?saddr=" + addressOne  + "&daddr=" + placeAddress + "&directionsmode=" + methodTransportOne;
        // shareLink2 = "comgooglemaps://?saddr=" + addressTwo  + "&daddr=" + placeAddress + "&directionsmode=" + methodTransportOne;

        $(".share_links").show();
        $(".share_links").html('<a href='+ shareLinkBoth +">Open Directions in Google Maps App</a>");
       
        console.log(shareLinkBoth);
        // console.log(shareLink1);
        // console.log(shareLink2);

        displayMap(placeAddress, methodTransportOne, methodTransportTwo);
    });
    
    return deferred.promise;
}

/**
  *  Displays two google maps at bottom of the page with directions from each origin point to the chosen business.
  *  
  *  @param {placeAddress, methodTransportOne, methodTransportTwo} <string> these are used to show directions on the map
  *
  */

function displayMap(placeAddress, methodTransportOne, methodTransportTwo) {
    // modifications needed in order to pass info to google maps directions api
    methodTransportOne = methodTransportOne.toLowerCase();
    methodTransportTwo = methodTransportTwo.toLowerCase();
    var addresses = getAddressesFromForm();
    var addressOne = addresses[0].split(' ').join('+');
    var addressTwo = addresses[1].split(' ').join('+');
    placeAddress = placeAddress.split(' ').join('+');

    var src1 = "https://www.google.com/maps/embed/v1/directions?key=" + googleMapsAPIKey + "&origin=" + addressOne + "&destination=" + placeAddress + "&mode=" + methodTransportOne;
    var src2 = "https://www.google.com/maps/embed/v1/directions?key=" + googleMapsAPIKey + "&origin=" + addressTwo + "&destination=" + placeAddress + "&mode=" + methodTransportTwo;

    $(".map_one").html('<div id="map_view1" class="col-mid-6"><iframe frameborder="0" style="border:0; width:100%; height:400px" src=' + src1 + '></iframe></div>');
    $(".map_two").html('<div id="map_view2" class="col-mid-6"><iframe frameborder="0" style="border:0; width:100%; height:400px" src=' + src2 + '></iframe></div>');
    $(".map_one").show();
    $(".map_two").show();

    /**
    *  this is used to get polyline from google maps directions service
    *  may use this if I decide to have one unified map
    */
    // var directionsService = new google.maps.DirectionsService();

    // var request = {

    //     origin: addressOne,
    //     destination: placeAddress,
    //     travelMode: methodTransportOne,

    // };

    // directionsService.route(request, function (data, status){
    //     if (status == google.maps.DirectionsStatus.OK) {
    //         console.log(data);
    //         var polyline = data.routes[0].overview_polyline;
    //         var polylinePoints = data.routes[0].overview_polyline.points;
    //         console.log(polyline);
    //         console.log(polylinePoints);
    //     }
    // });

}

