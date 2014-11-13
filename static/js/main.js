/** Global starting points. Accessed throughout recursive calls to findGatheringPoint */
var initialPointOne;
var initialPointTwo;

/** findGatheringPoint recursion counter. Places a upper limit on the number of iterations of our binary search */
const maxAttempts = 5;
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
        var addresses = getAdressesFromForm();
        // points is an array of values from our from inputs
        // makes coordinates from addresses
        makeCoordinates(addresses[0])
        .then(function(latLonPointOne) {
            console.log("Got first promise result");
            initialPointOne = latLonPointOne;
            return makeCoordinates(addresses[1])
            .then(function(latLonPointTwo) {
                console.log("Got second promise result");
                initialPointTwo = latLonPointTwo;
                return [latLonPointOne, latLonPointTwo];
            });
        })
        // .spread(function(latLonPointOne, latLonPointTwo) {
        .then(function(x) {
            latLonPointOne = x[0];
            latLonPointTwo = x[1];
            console.log("Got both latLons " + latLonPointOne + " " + latLonPointTwo);
            var initialMid = findMidPoint(latLonPointOne, latLonPointTwo);
            if (latLonPointOne, latLonPointTwo) {
                console.log("Started find gathering point", initialMid);
                return findGatheringPoint(initialPointOne, initialPointTwo, initialMid);
            } else {
                console.log("WTF?");
            }

        })
        .then(function(gatheringPoint) {
            console.log("Gathering Point: " + gatheringPoint);
            return findBusiness(gatheringPoint);
        })
        .then(function(businessLatLon){
            console.log("In the promises return of findBusiness");
            return displayMap(initialPointOne, initialPointTwo, businessLatLon);
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

            // console.log("Is makeCoordinates happening?");
            console.log("Lat:" + latlon[0]);
            console.log("Lon:" + latlon[1]);

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

function findGatheringPoint(pointOne, pointTwo, initialMid) {
    numAttempts++;
    //debugger;
    var deferred = Q.defer();

    // console.log("We're in the findGatheringPointFunction");
    console.log("initialPointOne : " + initialPointOne);
    return calculateDuration(initialPointOne, initialMid)
    .then(function(durationOne) {
        console.log("Got duration for pointOne " + durationOne);
        console.log("initialPointTwo : " + initialPointTwo);
        return calculateDuration(initialPointTwo, initialMid)
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
        var tolerance = 0.10 * ((durationOne + durationTwo) / 2);
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
            return findGatheringPoint(pointOne, initialMid, newMidpoint);
        }
        else {
            console.log("Duration two was greater!");
            newMidpoint = findMidPoint(pointTwo, initialMid);
            console.log("newMidpoint between pointTwo and initialMid: " + newMidpoint);
            return findGatheringPoint(initialMid, pointTwo, newMidpoint);
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
function calculateDuration(pointOne, pointTwo) {
    var deferred = Q.defer();

    console.log("PointOne: " + pointOne);
    console.log("PointTwo: " + pointTwo);
    pointOne = new google.maps.LatLng(pointOne[0], pointOne[1]);
    pointTwo = new google.maps.LatLng(pointTwo[0], pointTwo[1]);
    var service = new google.maps.DistanceMatrixService();
    console.log("About to get Distance Matrix");
    
    service.getDistanceMatrix(
        {
            origins: [pointOne],
            destinations: [pointTwo],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false,
            durationInTraffic: true,
        }, function(response, status) {
            // TODO : Check status for success. Call deferred.reject(new Error("Some error message"));
            // value in this case is seconds, duration is in seconds
            console.log(response);
            var duration = (response.rows[0].elements[0].duration.value);
            console.log("Got google duration " + duration);
            deferred.resolve(duration);
        });

    console.log("leaving calculateDuration");
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
    var deferred = Q.defer();
    // var infowindow;

    // console.log("findBusiness", gatheringPoint);
    var spotToSearch = new google.maps.LatLng(gatheringPoint[0], gatheringPoint[1]);
    // console.log("Spot to search: " + spotToSearch);

    var map = new google.maps.Map(document.getElementById('map-canvas'));
    var type = $("input:checked").val();
    console.log("Type: " + type);
    // console.log("About to find business");
    var request = {
        location: spotToSearch,
        radius: '1000',
        // maybe this should be keyword
        types: [type],
        openNow: true,
    };

    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request,
    function(request, status) {
        console.log("Status: " + status);
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            var placeObj = (request[0]);
            var placeLat = (request[0].geometry.location.k);
            var placeLon = (request[0].geometry.location.B);
            var placeName = (request[0].name);
            var placeAddress = (request[0].vicinity);

            var placeComplete= [placeLat, placeLon];
            console.log("Place object: ");
            console.log(placeObj);
            // createMarker(place);
            // console.log("PlaceLat");
            // console.log(placeLat);
            console.log("PlaceComplete: ");
            console.log(placeComplete);

            // little bit of jquery to show name and address of business on page
            $("#business").html("<h2>" + placeName + "</h2><p>" + placeAddress +"</p>");
            deferred.resolve(placeComplete);
        }
        else {
            console.log(status);
        }
    });
    // console.log("Leaving findBusiness");
    return deferred.promise;
}

function displayMap(initialPointOne, initialPointTwo, businessLatLon) {
    var src1 = "https://www.google.com/maps/embed/v1/directions?key=AIzaSyD94Hy8ebu6mo6BwokrIHw2MqOGrlnA26M&origin=" + initialPointOne + "&destination=" + businessLatLon;
    $("#map_view1").attr("src", src1);
    var src2 = "https://www.google.com/maps/embed/v1/directions?key=AIzaSyD94Hy8ebu6mo6BwokrIHw2MqOGrlnA26M&origin=" + initialPointTwo + "&destination=" + businessLatLon;
    $("#map_view2").attr("src", src2);
}



