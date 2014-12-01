gather
=========
###### Let's Meet in the Middle.

<h5>Web app that chooses a spot between two locations that is equi-time between them. </h5>

Users can specify two origin locations, transportation methods used, and desired type of location (bar, restaurant, café, etc).

Gather then returns the best spot for the two people to meet at, so that they both spend the same time getting there.  A map then displays directions from each origin address to the 'gathering point' business. 
Users can then ask for a different spot nearby, if they do not want to meet at that particular establishment. The business details and map with then reload with new information. 

###### Stack:

*	Python
*	Flask
*	Jinja
*	Javascript
*	Jquery
*	Promises (Q library)
*	HTML/CSS
*	Bootstrap
*	Google Maps APIs: JS Embed, Distance Matrix, Places Autocomplete, Places Nearby, Directions

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

static
--------------------
* assets: all images used in project
* css: style formatting, personal is custom.css, all other files are bootstrap
* fonts: fonts included in bootstrap
* js
	> bootstrap.js and bootstrap.min.js: javascript included in bootstrap
	> jquery.autocomplete.js: used in address autocompletion
	> main.js: main JS file
	> oldmap.js: JS file that shows two maps instead of one
	> typeahead.bundle.js: used for typeahead autocompletion


templates
--------------------
* main.html: single page app, so a single HTML template for the app

.gitignore
--------------------
* file used to ignore local virtual environment

Procfile
--------------------
* needed for heroku deployment

READ.md
--------------------
* what you're currently reading

app.py
--------------------
* flask app python script

requirements.txt
--------------------
* list of required modules for installation




###### Acknowledgements:

All icons from the noun project.  

The tree is entitled 'Tree' by Mister Pixel from The Noun Project.

The rain is entitled 'Train' by Jamison Wieser from The Noun Project

Thanks!

