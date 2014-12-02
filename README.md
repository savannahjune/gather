gather map
=========
###### Let's Meet in the Middle.

<h5>Web app that chooses a spot between two locations that is equi-time between them. </h5>

Have you ever had trouble deciding where you and a friend should meet up for coffee when time is of the essence? Or have you ever been in an unfamiliar city and wondered where's the best spot for you to grab lunch with someone on the other side of the city? Worry no longer, because gather map has you covered. 

Users can specify two origin locations, transportation methods used, and desired type of location (bar, restaurant, café, etc).

Gather then returns the best spot for the two people to meet at, so that they both spend the same time getting there. There is also a box with information about that business: phone number, address, hours, rating, and price level. A map then displays directions from each origin address to the 'gathering point' business and displays the estimated travel time for each user. There's also a link to open directions in either the Google Maps app (if the user is on a mobile device) or on maps.google.com.

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


<strong>templates</strong>
- main.html: single page app, so a single HTML template for the app

<strong>.gitignore</strong>
- file used to ignore local virtual environment

<strong>Procfile</strong>
- needed for heroku deployment

<strong>README.md</strong>
- what you're currently reading

<strong>app.py</strong>
- flask app python script

<strong>requirements.txt</strong>
- list of required modules for installation

###### Walk Through:

<p>When a user first visits gathermap.com, they must first specify the two locations they and their friend are coming from. This input uses typeahead.js and Google Maps Autocomplete API to predict the user's address as they type. Then users specify which type of transportation they'll be using and their friend will be using to meet up.  Users can choose to drive, use public transit, walk, or bike. Finally, they click to choose which type of location they'd like to meet at: bar, restaurant, café, park, or library. Then they click "Gather!" and the app begins choosing a location for their meeting based on their inputs.<p>

<img src="static/assets/addressinput.gif" alt="Address Input">



###### Acknowledgements:

The tree icon is entitled 'Tree' by Mister Pixel from The Noun Project.

The train icon is entitled 'Train' by Jamison Wieser from The Noun Project

Thanks!

