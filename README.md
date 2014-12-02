Gather Map
=========
###### Let's Meet in the Middle.

<strong>Web app that chooses a spot between two locations that is equi-time between them.</strong>

Have you ever had trouble deciding where you and a friend should meet up for coffee when time is of the essence? Or have you ever been in an unfamiliar city and wondered where's the best spot for you to grab lunch with someone on the other side of the city? Worry no longer, because gather map has you covered. 

Users can specify two origin locations, transportation methods used, and desired type of location (bar, restaurant, café, etc).

Gather map then returns the best spot for the two people to meet at, so that they both spend the same time getting there. There is also a box with information about that business: phone number, address, hours, rating, and price level. A map then displays directions from each origin address to the 'gathering point' business and displays the estimated travel time for each user. There's also a link to open directions in either the Google Maps app (if the user is on a mobile device) or on maps.google.com.

Users can then ask for a different spot nearby, if they do not want to meet at that particular establishment. The business info and map then reload with new information. 

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

###### Getting started:

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

###### File structure:

<strong>static</strong>
- assets: all images used in project
- css: style formatting, personal is custom.css, all other files are bootstrap
- fonts: fonts included in bootstrap
- js
	- bootstrap.js and bootstrap.min.js: javascript included in bootstrap<br>
	- jquery.autocomplete.js: used in address autocompletion<br>
	- main.js: main JS file<br>
	- oldmap.js: JS file that shows two maps instead of one<br>
	- typeahead.bundle.js: used for typeahead autocompletion<br>

<strong>templates</strong>: main.html: single page app, so a single HTML template for the app

<strong>.gitignore</strong>: file used to ignore local virtual environment

<strong>Procfile</strong>: needed for heroku deployment

<strong>README.md</strong>: what you're currently reading

<strong>app.py</strong>: flask app python script

<strong>requirements.txt</strong>: list of required modules for installation

###### Walk Through:

<p>When a user first visits gathermap.com, they must first specify the two locations they and their friend are coming from. This input uses typeahead.js and Google Maps Autocomplete API to predict the user's address as they type. Then users specify which type of transportation they'll be using and their friend will be using to meet up.  Users can choose to drive, use public transit, walk, or bike. Finally, they click to choose which type of location they'd like to meet at: bar, restaurant, café, park, or library. Then they click "Gather!" and the app begins choosing a location for their meeting based on their inputs.</p>

<img src="static/assets/addressinput.gif" alt="Address Input">

<p>Next, gather map grabs the addresses from the form and geocodes them into latitude and longitude coordinates using the Google Maps Geocoder API. Then these coordinates are passed to a function that finds the geographical midpoint between the two coordinates. Then the app is ready to find the gathering point between these two locations. </p>

###### Finding the Gathering Point:

<p>Using the geographical midpoint, initialMid, as a starting point, findGatheringPoint calls the calculateDuration function between each starting point and the initialMid taking into account the type of transportation that user is utilizing. The calculateDuration function uses the Google Maps Distance Matrix API for walking, biking, and driving, as it can factor in traffic into its queries, but it does not allow for transit queries.  For transit, calculateDuration uses the Google Maps Directions API. 

Next, it compares the travel time of person one (durationOne) to the travel time of person two (durationTwo).  Using a binary search, the initialMid is reset between either the first location and initialMid if the travel time for person one is greater than the travel time of person two, or between the initialMid and person two's location if their travel time is greater.  Sometimes the two durations are within the defined tolerance (5% difference allowed) right away, but if not this binary search continues until the durations are within the tolerance or more than ten attempts have been made. This is to maximize speed without sacrificing accuracy. Most queries require about five to seven attempts to reach the tolerance.</p>

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
        var tolerance = 0.05 * ((durationOne + durationTwo) / 2);
        if ((Math.abs(durationOne - durationTwo) <= tolerance) || numAttempts >= maxAttempts) {
            if (numAttempts >= maxAttempts) {
                console.log("Stopped findGatheringPoint after max attempts reached");
            }
            // if the coordinate meets all requirements, then use it as gathering point
            deferred.resolve(initialMid);
            return deferred.promise;

        /**
         * the else if and else below constitute the binary search tree
         * that this algorithm uses to find optimal midpoint between two people
         */
        }
        else if (durationOne > durationTwo) {
            /** if duration one is greater, move initialMid to between initialMid and pointOne
             * by passing it into findMidPoint
             */
            newMidpoint = findMidPoint(pointOne, initialMid);
            return findGatheringPoint(pointOne, initialMid, newMidpoint, methodTransportOne, methodTransportTwo);
        }
        else {
            /** if duration two is greater, move initialMid to between initialMid and pointTwo
             * by passing it into findMidPoint
             */
            newMidpoint = findMidPoint(pointTwo, initialMid);
            return findGatheringPoint(initialMid, pointTwo, newMidpoint, methodTransportOne, methodTransportTwo);
        }

    })
    .catch(function (error) {
        console.log("findGatheringPoint Error: " + error);
    });

}
</code></pre>

Here's the console showing the findGatheringPoint algorithm in action:

<img src="static/assets/console.png" alt="findGatheringPoint Console">

Once the gathering point is found, a call is made to the Google Maps Place Search API to find 
a spot nearby that matches the type of location that user specified. (If a business is not found, the map displays the gatheringPoint and directions to it from each origin point, with the disclaimer that no business was found the in the area.) Once a spot is found, the Google Maps Place ID is passed to the displayPlaceInfo function, which displays info about 
the business on the right hand side of the screen.

- Explain how map is displayed

- Explain "choose another"

- Explain promises


###### Acknowledgements:

The tree icon is entitled 'Tree' by Mister Pixel from The Noun Project.

The train icon is entitled 'Train' by Jamison Wieser from The Noun Project

Thanks!

