from flask import Flask, render_template, redirect, request
import os

app = Flask(__name__)
app.secret_key= 'alsjksdbzuhbozsdi'

@app.route("/")
def run_app():   
	key = os.environ.get("GOOGLE_MAPS_EMBED_KEY")
	return render_template("main.html", key=key)

if __name__ == "__main__":
    app.run(debug = True)