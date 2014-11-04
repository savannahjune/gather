from flask import Flask, render_template, redirect, request
import os

app = Flask(__name__)
app.secret_key= 'alsjksdbzuhbozsdi'

@app.route("/")
def run_app():   
    return render_template("main.html")

@app.route("/map")
def search():
    key = os.environ.get("GOOGLE_MAPS_EMBED_KEY")
    return render_template("map.html", key=key)

if __name__ == "__main__":
    app.run(debug = True)