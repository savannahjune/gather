from flask import Flask, render_template, redirect, request
import os

app = Flask(__name__)
app.secret_key= 'alsjksdbzuhbozsdi'

@app.route("/")
def run_app():   
    return render_template("main.html")

# @app.route("/map", methods=["POST"])
# def get_locations(): 
# 	print "You got here" 
# 	location_one = request.form.get("location_one")
# 	location_two = request.form.get("location_two")
# 	print location_one
# 	print location_two
# 	return redirect("/map", location_one=location_one, 
#     	location_two=location_two)

@app.route("/map")
def search():
    key = os.environ.get("GOOGLE_MAPS_EMBED_KEY")
    return render_template("map.html", key=key)

if __name__ == "__main__":
    app.run(debug = True)