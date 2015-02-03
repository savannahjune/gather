<a href="http://gathermap.com/">Gather Map</a> by <a href="https://www.linkedin.com/in/savannahhenderson">Savannah Henderson</a>
=========
###### Let's Meet in the Middle.

<strong>A web app that chooses isochronal meeting places between two locations taking into account methods of transportation.</strong>

Have you ever had trouble deciding where you and a friend should meet up for coffee when time is of the essence? Or have you ever been in an unfamiliar city and wondered where's the best spot for you to grab lunch with someone on the other side of the city? Worry no longer, because gather map has you covered. 

Users can specify two origin locations, transportation methods used, and desired type of location (bar, restaurant, café, etc).

Gather map then returns the best spot for the two people to meet at, so that they both spend the same amount of time getting there. There is also a box with information about that location: phone number, address, hours, rating, and price level. A map then displays directions from each origin address to the meeting location and displays the estimated travel time for each user. There's also a link to open directions in either the Google Maps app (if the user is on a mobile device) or on maps.google.com.

Users can then ask for a different spot nearby, if they do not want to meet at that particular establishment. The location info and map then reload with new information. 

####Table of Contents
- [Stack](#stack)
- [Try it Yourself](#getting-started)
- [Walk Through](#walk-through)
  - [Finding the Gathering Point](#finding-the-gathering-point)
  - [Displaying Place Info and Map](#displaying-place-info-and-map)
  - [Choosing Another Place](#choosing-another-place)
- [Promises](#promises)
- [About Me](#about-me)
- [Acknowledgements](#acknowledgements)

###### Stack:

*	Python
*	Flask
*	Jinja
*	Javascript
*	Jquery
*	Promises (Q library)
*	HTML/CSS
*	Bootstrap
*	Google Maps APIs: JS Embed, Distance Matrix, Autocomplete, Places Nearby, Directions

###### Try it yourself:

You can visit <a href="gathermap.com">gathermap.com</a> to use the app yourself, or download the code to your machine to run it locally.  

To run the machine on your own machine:

1) First, clone this directory to your computer.

<pre><code>$ git clone https://github.com/savannahjune/gather.git</code></pre>

2) Create and activate a virtual environment in the same directory on your computer.

<pre><code>$ pip install virtualenv
$ virtualenv env
$ source env/bin/activate 
</code></pre>

3) Install all required packages using pip.

<pre><code>(env)$ pip install -r requirements.txt
</code></pre>

4) Then run python app.py from the gather directory in terminal on your computer and you'll be ready to go!

###### Walk Through:

<p>When a user first visits gathermap.com, they must first specify the two locations they and their friend are coming from. This input uses typeahead.js and Google Maps Autocomplete API to predict the user's address as they type. This is important, since it makes sure that the user chooses addresses that exist. Then users specify which type of transportation they and their friend will be using to meet up (they can each use a different method if they so choose).  Users can choose to drive, use public transit, walk, or bike. Next, they click to choose which type of location they'd like to meet at: bar, restaurant, café, park, or library. Finally, they click "Gather!" and the app begins choosing a location for their meeting based on their inputs.</p>

<img src="static/assets/addressinput.gif" alt="Address Input">

<p>'Behind the scenes', gather map grabs the addresses from the form and geocodes them into latitude and longitude coordinates using the Google Maps Geocoder Javascript API. Then these coordinates are passed to a function that finds the geographical midpoint between the two coordinates. Then the app is ready to find the gathering point between these two locations. (See lines 28-86 of main.js for function calls in main promise chain, as well as lines 161-248 of main.js for the modularized functions called in the main promise chain for these operations.) </p>

###### Finding the Gathering Point:

<p>Using the geographical midpoint, initialMid, as a starting point, findGatheringPoint calls the calculateDuration function between each starting point and the initialMid taking into account the type of transportation that user is utilizing. The calculateDuration function uses the Google Maps Distance Matrix API for walking, biking, and driving, as it can factor in traffic into its queries, but it does not allow for transit queries.  For transit, calculateDuration uses the Google Maps Directions API. 

Next, it compares the travel time of person one (durationOne) to the travel time of person two (durationTwo).  Using a binary search, the initialMid is reset between either the first location and initialMid if the travel time for person one is greater than the travel time of person two, or between the initialMid and person two's location if their travel time is greater.  Sometimes the two durations are within the defined tolerance (5% difference allowed) right away, but if not this binary search continues until the durations are within the tolerance or more than ten attempts have been made. This is to maximize speed without sacrificing accuracy. Most queries require about five to seven attempts to reach the tolerance. The code below shows this findGatheringPoint function, but some comments have been removed for brevity.  Please see lines 250-381 of the main.js file for more comments.</p>

<pre><code>
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
    .then(function(durationOne) {
        return calculateDuration(initialPointTwo, initialMid, methodTransportTwo)
               .then(function(durationTwo) {
                    return [durationOne, durationTwo];
               });
    })
    .spread(function(durationOne, durationTwo) {
        var tolerance = 0.05 * ((durationOne + durationTwo) / 2);
        if ((Math.abs(durationOne - durationTwo) <= tolerance) || numAttempts >= maxAttempts) {
            if (numAttempts >= maxAttempts) {
            }
            deferred.resolve(initialMid);
            return deferred.promise;
        }
        else if (durationOne > durationTwo) {
            newMidpoint = findMidPoint(pointOne, initialMid);
            return findGatheringPoint(pointOne, initialMid, newMidpoint, methodTransportOne, methodTransportTwo);
        }
        else {
            newMidpoint = findMidPoint(pointTwo, initialMid);
            return findGatheringPoint(initialMid, pointTwo, newMidpoint, methodTransportOne, methodTransportTwo);
        }
    })
    .catch(function (error) {
        console.log("findGatheringPoint Error: " + error);
    });
}</code></pre>

Here's the console showing the findGatheringPoint algorithm in action:

<img src="static/assets/console.png" alt="findGatheringPoint Console">

###### Displaying Place Info and Map:

Once the gathering point is found, a call is made to the Google Maps Place Search API to find 
a spot nearby that matches the type of location that user specified. (If that type of location is not found, the map displays the gatheringPoint and directions to it from each origin point, with the disclaimer that no exact location was found the in the area.) Once a spot is found, the Google Maps Place ID is passed to the displayPlaceInfo function, which displays info about the location on the right hand side of the screen. There is a link to open detailed directions to the spot in the Google Maps website  or if they are on mobile, the link brings up the Google Maps app. 

<img src="static/assets/gatherstarbucks.gif" alt="First Gather Result">

As the location info displays on the right side of the screen, the map below displays the route from each origin point to the chosen location. The Google Maps Embed API does not allow for multiple origin points, which is why polylines are used rather than simply passing the origin points and desitination points to Google Maps Embed. These polylines for each route are generated by a call to the Google Directions API and then passed to the map in main.html, along with each origin point and the chosen gathering location. This allows for a unified map, which is a lot easier for users to comprehend than two Google Maps Embed maps. 

###### Choosing Another Place:

You'll notice that in the example above, Starbucks was the first result displayed to users. If the user would prefer not to go to Starbucks, they can simply click "Pick Me Another" and the next result is displayed on the screen, by accessing the next item in the nearby businesses array. The placeID of the next business is then sent to the displayPlaceInfo to update the location's info and the map refreshes as well with new polylines and a new gathering point.  The user can keep requesting new locations until the Google Places API runs out of responses, then the "Pick Me Another" button disappears and the user must start another gather query if they would like other results.  

<img src="static/assets/pickmeanother.gif" alt="Pick Me Another">

###### Promises:

As you may have noticed, this project requires a lot of Google Maps API calls of all sorts, and these API calls are all asynchronous.  As the project developed, the main.js filed started to resemble <a href="http://callbackhell.com/">"callback hell"</a>. Thus, I decided to use Promises, specifically the <a href="https://github.com/kriskowal/q">Q library</a>. I chose the Q library for its excellent documentation and ample support from the open-source community.  

There is a main promise chain that forms the backbone of my project. This main chain ensures that no function begins before the previous function has returned a usable value (object, array, string, integer, etc.). It also creates a nice outline of the project's functions.  To see this main chain, check out lines 28-160 in the main.js file. 

###### About me:

My name is Savannah Henderson and I am an engineering fellow at Hackbright Academy. Gather Map is my final project for that fellowship.  It brings together my love of efficiency, logistics, timeliness, and maps! Please email me at savannahjune@gmail.com if you have any questions about the project. 

###### Acknowledgements:

The tree icon is entitled 'Tree' by Mister Pixel from The Noun Project.

The train icon is entitled 'Train' by Jamison Wieser from The Noun Project.

Thanks!

