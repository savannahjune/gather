/** Global starting points. Accessed throughout recursive calls to findGatheringPoint **/
var initialPointOne;
var initialPointTwo;

/** findGatheringPoint recursion counter. Places a upper limit on the number of iterations of our binary search.  Higher number
of allowed attempts makes the gathering point more accurate, but takes more time **/
const maxAttempts = 6;
var numAttempts;

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
        numAttempts = 0;
        // console.log('submitted form');
        evt.preventDefault();
        var methodTransportOne = $("input[id=one]:checked").val();
        // console.log("Method transport one: " + methodTransportOne);
        var methodTransportTwo = $("input[id=two]:checked").val();
        // console.log("Method transport two: " + methodTransportTwo);
        var addresses = getAddressesFromForm();
        // points is an array of values from our from inputs
        // makes coordinates from addresses
        makeCoordinates(addresses[0])
        .then(function(latLonPointOne) {
            // console.log("Got first promise result");
            initialPointOne = latLonPointOne;
            return makeCoordinates(addresses[1])
            .then(function(latLonPointTwo) {
                // console.log("Got second promise result");
                initialPointTwo = latLonPointTwo;
                return [latLonPointOne, latLonPointTwo];
            });
        })
        .then(function(latlons) {
            latLonPointOne = latlons[0];
            latLonPointTwo = latlons[1];
            // console.log("Got both latLons " + latLonPointOne + " " + latLonPointTwo);
            var initialMid = findMidPoint(latLonPointOne, latLonPointTwo);
            if (latLonPointOne, latLonPointTwo) {
                // console.log("Started find gathering point", initialMid);
                return findGatheringPoint(initialPointOne, initialPointTwo, initialMid, methodTransportOne, methodTransportTwo);
            } else {
                // console.log("Error with latlons");
            }

        })
        .then(function(gatheringPoint) {
            console.log("Gathering Point: " + gatheringPoint);
            return findBusiness(gatheringPoint);
        })
        .then(function(businessPlaceID){
            return displayPlaceInfo(businessPlaceID);
        })
        .then(function(placeAddress){
            // console.log("In the promises return of findBusiness");
            // console.log("Place address in promises chain: " + placeAddress);
            return displayMap(placeAddress, methodTransportOne, methodTransportTwo);
        })
        .catch(function (error) {
        console.log("Main Chain Error: " + error);
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
  *  @param {query} the input to suggest autocomplete matches against. e.g: "123 Main St"
  *  @param {cb} a callback to deliver the potential matches. Takes a single array argument of matches
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
  *  @param {target} - address to become a coordinate
  *  
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
    // console.log("Mid_point: " + mid_point);
    return mid_point;
}

 // this is the formual to find the great circle mid point. 
    // useful if the origins are more than 250 miles apart
    // var Bx = Math.cos(φ2) * Math.cos(λ2-λ1);
    // var By = Math.cos(φ2) * Math.sin(λ2-λ1);
    // var φ3 = Math.atan2(Math.sin(φ1) + Math.sin(φ2),
    //                 Math.sqrt( (Math.cos(φ1)+Bx)*(Math.cos(φ1)+Bx) + By*By ) );
    // var λ3 = λ1 + Math.atan2(By, Math.cos(φ1) + Bx);

/**
  *  Finds best gathering point between two places, as far as time to reach a midpoint
  *  
  *  @param {pointOne} this is the first place, must be in coordinate form for math
  *  @param {pointTwo} this is the second place, must be in coordinate form for math
  *  @param {initialMid} this is the initial midpoint, will be redefined in this recursive function
  */

function findGatheringPoint(pointOne, pointTwo, initialMid, methodTransportOne, methodTransportTwo) {
    numAttempts++;
    var deferred = Q.defer();

    // console.log("We're in the findGatheringPointFunction");
    // console.log("initialPointOne : " + initialPointOne);
    return calculateDuration(initialPointOne, initialMid, methodTransportOne)
    .then(function(durationOne) {
        console.log("Got duration for pointOne " + durationOne);
        console.log("initialPointTwo : " + initialPointTwo);
        return calculateDuration(initialPointTwo, initialMid, methodTransportTwo)
               .then(function(durationTwo) {
                    return [durationOne, durationTwo];
               });
    })
    .spread(function(durationOne, durationTwo) {

        // Now we have valid results for the duration from pointOne to initialMid
        // and the duration from pointTwo to initialMid

        // console.log("Hello we're in the calc duration callback!");
        console.log("Duration one: " + durationOne);
        console.log("Duration two: " + durationTwo);
        console.log("Difference in duration: " + Math.abs(durationOne - durationTwo));
        var tolerance = 0.05 * ((durationOne + durationTwo) / 2);
        if ((Math.abs(durationOne - durationTwo) <= tolerance) || numAttempts >= maxAttempts) {
            if (numAttempts >= maxAttempts) {
                console.log("Stopped findGatheringPoint after max attempts reached");
            }
            deferred.resolve(initialMid);
            console.log("Found the duration midpoint: " + initialMid);
            return deferred.promise;

        }
        else if (durationOne > durationTwo) {
            console.log("Duration one was greater!");
            newMidpoint = findMidPoint(pointOne, initialMid);
            console.log("newMidpoint between pointOne and initialMid: " + newMidpoint);
            return findGatheringPoint(pointOne, initialMid, newMidpoint, methodTransportOne, methodTransportTwo);
        }
        else {
            console.log("Duration two was greater!");
            newMidpoint = findMidPoint(pointTwo, initialMid);
            console.log("newMidpoint between pointTwo and initialMid: " + newMidpoint);
            return findGatheringPoint(initialMid, pointTwo, newMidpoint, methodTransportOne, methodTransportTwo);
        }

    })
    .catch(function (error) {
        console.log("findGatheringPoint Error: " + error);
    });

}

/**
  *  Finds duration of time between two places
  *  
  *
  *  @param {pointOne} this is the first place, must be in coordinate form for math
  *  @param {pointTwo} this is the second place, must be in coordinate form for math
  */
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
  *  @param {gatheringPoint} this is the equal time midpoint from the findGatheringPoint function
  *  
  */


function findBusiness(gatheringPoint) {
    /* sets up index for business search */
    var businessIndex = 0;
    var deferred = Q.defer();

    // console.log("findBusiness", gatheringPoint);
    var spotToSearch = new google.maps.LatLng(gatheringPoint[0], gatheringPoint[1]);
    // console.log("Spot to search: " + spotToSearch);

    var map = new google.maps.Map(document.getElementById('map-canvas'));
    // so turns out it just uses first selected item, should instead loop through list and then get vals
    var type = $("input[type=checkbox]:checked").val();
    var initialRadius = 250;
    // console.log("Type: " + type);
    // console.log("About to find business");
    var request = {
        location: spotToSearch,
        // radius: "'" + initialRadius + "'",
        // radius: '50000',
        // maybe this should be keyword
        types: [type],
        // openNow: true
        rankBy: google.maps.places.RankBy.DISTANCE
    };


    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request,
    function businessOptions(response, status) {
        // console.log("businessIndex at the top: ");
        // console.log(businessIndex);
        // debugger;
        // console.log("Status: " + status);
        // console.log("Business options response: ");
        // console.log(response);
        if (response[businessIndex]){
            // console.log("In the response");
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
                    // console.log("businessIndex inside submit: ");
                    // console.log(businessIndex);
                    placeID = businessOptions(response, status);
                    displayPlaceInfo(placeID);
                });
            }
            console.log(placeID);
            return placeID;
        }
        else {
            $(".next_spot").hide();
            // console.log("businessIndex should now be out of range");
            // console.log(status);
        }
    }); /* end of businessOptions */
    // console.log("Leaving findBusiness");
    return deferred.promise;
} /* end of findBusiness */

/**
  *  Finds specific info about a business using Google Places Details API
  *  
  *
  *  @param {placeID} placeID from the current business found in the findBusiness function
  *  
  */

function displayPlaceInfo(placeID) {
    // console.log("Place ID in dipslayPlaceInfo: ");
    // console.log(placeID);
    var placeDetailsArray = [];
    var deferred = Q.defer();
    var map = new google.maps.Map(document.getElementById('map-canvas'));

    var request = {
        placeId: placeID,
    };

    var service = new google.maps.places.PlacesService(map);
    service.getDetails(request,
    function(response, status) {
        var placeInfo = response;
        // this displays the name and makes it a link to the required Google website for the place
        $("#placeName").html("<a href=\"" + response.url + "\">" + response.name + "</a>");
        var placeAddress = (response.formatted_address);
        $("#placeAddress").html(placeAddress);
        var placeLat = (response.geometry.location.k);
        var placeLon = (response.geometry.location.B);
        var placeLatLon = [placeLat, placeLon];
        if (response.rating){
            $("#googlePlusRating").html("Google+ Rating: " + response.rating + "/ 5 ");
        }
        if (response.formatted_phone_number){
            $("#placePhoneNumber").html(response.formatted_phone_number);
        }
        if (response.opening_hours){
            $("#hoursSunday").html(response.opening_hours.weekday_text[6]);
            $("#hoursMonday").html(response.opening_hours.weekday_text[0]);
            $("#hoursTuesday").html(response.opening_hours.weekday_text[1]);
            $("#hoursWednesday").html(response.opening_hours.weekday_text[2]);
            $("#hoursThursday").html(response.opening_hours.weekday_text[3]);
            $("#hoursFriday").html(response.opening_hours.weekday_text[4]);
            $("#hoursSaturday").html(response.opening_hours.weekday_text[5]);
        }
        
        if (response.website) {
            $("#placeWebsite").html("<a href\"=" + response.website + "\">website</a>");
        }
        if (response.price_level){
            if (response.price_level === 1) {
                $("#placePriceLevel").html("$ / $$$$");
            }
            if (response.price_level === 2) {
                $("#placePriceLevel").html("$$ / $$$$");
            }
            if (response.price_level === 3) {
                $("#placePriceLevel").html("$$$ / $$$$");
            }
            if (response.price_level === 4) {
                $("#placePriceLevel").html("$$$$ / $$$$");
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
        var methodTransportOne = $("input[id=one]:checked").val();
        // console.log("Method transport one: " + methodTransportOne);
        var methodTransportTwo = $("input[id=two]:checked").val();
        // console.log("Method transport two: " + methodTransportTwo);
        // console.log("Place address" + placeAddress);
        displayMap(placeAddress, methodTransportOne, methodTransportTwo);
    });
    
    return deferred.promise;
}

function displayMap(placeAddress, methodTransportOne, methodTransportTwo) {
    // console.log("Place address:");
    // console.log(placeAddress);
    methodTransportOne = methodTransportOne.toLowerCase();
    methodTransportTwo = methodTransportTwo.toLowerCase();
    var addresses = getAddressesFromForm();
    // console.log("addresses in display map: ");
    // console.log(addresses[0]);
    // console.log(addresses[1]);
    var addressOne = addresses[0].split(' ').join('+');
    var addressTwo = addresses[1].split(' ').join('+');
    placeAddress = placeAddress.split(' ').join('+');
    var src1 = "https://www.google.com/maps/embed/v1/directions?key=AIzaSyD94Hy8ebu6mo6BwokrIHw2MqOGrlnA26M&origin=" + addressOne + "&destination=" + placeAddress + "&mode=" + methodTransportOne;
    var src2 = "https://www.google.com/maps/embed/v1/directions?key=AIzaSyD94Hy8ebu6mo6BwokrIHw2MqOGrlnA26M&origin=" + addressTwo + "&destination=" + placeAddress + "&mode=" + methodTransportTwo;
    
    // console.log("Links for Google: ");
    // console.log(src1);
    // console.log(src2);

    // if you change this jquery selector to $(".maps").append, you can keep a list of all the queries the user has made
    $(".maps").html('<iframe id="map_view1" width="600" height="450" frameborder="0" style="border:0" src=' + src1 + '></iframe><iframe id="map_view2" width="600" height="450" frameborder="0" style="border:0" src=' + src2 + '></iframe>');
    $(".maps").show();

    shareLink1 = "comgooglemaps://?saddr=" + addressOne  + "&daddr=" + placeAddress + "&directionsmode=" + methodTransportOne;
    shareLink2 = "comgooglemaps://?saddr=" + addressTwo  + "&daddr=" + placeAddress + "&directionsmode=" + methodTransportOne;

    $("#share_links").html('<a href='+ shareLink1 +">Open this map in Google Maps</a>");
    $("#share_links").html('<a href='+ shareLink2 +">Open this map in Google Maps</a>");
    console.log(shareLink1);
    console.log(shareLink2);
}

