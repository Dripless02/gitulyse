import os

from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def index():
    data = {
        "data": "Hello from the Gitulyse backend index endpoint",
    }

    return data, 200


@app.route("/github-token", methods=["POST"])
def github_token():
    token = request.get_json()["access_token"]
    print("Token Retrieved from Frontend")
    return "Token Retrieved from Frontend", 200


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
